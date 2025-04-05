import express, { Express, Request, Response } from 'express';
import * as http from 'http';
import {
    createLessonRouter,
    LessonRouterDependencies
} from '../../lesson/router';
import { createQuizRouter, QuizRouterDependencies } from '../../quiz/router';
import { Service } from '../service';
import { ServerConfig } from './config';
import { getVideoDetails } from './youtube/getVideoDetails';
import { fetchVideoTranscript } from './youtube/getCaptions';
import { requestErrorHandler } from './utils';

export const createBasicApp = (): Express => {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    return app;
};

export type ServerDependencies = QuizRouterDependencies &
    LessonRouterDependencies;

export class Server extends Service {
    app: Express;
    private server: http.Server;

    constructor(
        private readonly dependencies: ServerDependencies,
        private readonly config: ServerConfig
    ) {
        super();
        this.app = createBasicApp();
        this.useRouters();
        this.useErrorHandler();

        this.server = http.createServer(this.app);


        this.registerRoutes();
    }

    private registerRoutes(): void {
        this.app.get('/youtube/:videoId', this.handleYouTubeRoute.bind(this));
    }

    private async handleYouTubeRoute(req: Request, res: Response): Promise<void> {
        const { videoId } = req.params;

        try {
            const videoDetails = await getVideoDetails(videoId);
            if (!videoDetails) {
                res.status(404).json({ error: 'Video not found or details unavailable.' });
                return;
            }

            const transcript = await fetchVideoTranscript(videoId);

            res.json({
                videoDetails,
                transcript: transcript || 'No transcript available.',
            });
        } catch (error: any) {
            console.error('Error processing request:', error.message);
            res.status(500).json({ error: 'Internal server error.' });
        }
    }

    private useRouters = () => {
        this.app.use('/lessons', createLessonRouter(this.dependencies));
        this.app.use('/quizzes', createQuizRouter(this.dependencies));
    };

    private useErrorHandler = () => {
        this.app.use(requestErrorHandler);
    };

    async start() {
        const { port } = this.config;

        return new Promise<void>((resolve, reject) => {
            this.server.listen(port, () => {
                console.log('server is running on port', port);
                resolve();
            });
            this.server.once('error', reject);
        });
    }

    async stop() {
        return new Promise<void>((resolve, reject) => {
            this.server.close((error) => (error ? reject(error) : resolve()));
        });
    }
}