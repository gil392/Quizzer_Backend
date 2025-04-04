import express, { Express, Request, Response } from 'express';
import * as http from 'http';
import { Service } from '../service';
import { ServerConfig } from './config';
import { getVideoDetails } from './youtube/getVideoDetails';
import { fetchVideoTranscript } from './youtube/getCaptions';

export class Server extends Service {
    app: Express;
    private server: http.Server;

    constructor(private readonly config: ServerConfig) {
        super();
        this.app = express();
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