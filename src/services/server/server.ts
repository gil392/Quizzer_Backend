import cors from 'cors';
import express, { Express } from 'express';
import * as http from 'http';
import {
    AuthRouterDependencies,
    createAuthRouter
} from '../../authentication/router';
import {
    createLessonRouter,
    LessonRouterDependencies
} from '../../lesson/router';
import { createQuizRouter, QuizRouterDependencies } from '../../quiz/router';
import { Service } from '../service';
import { ServerConfig } from './config';
import { requestErrorHandler } from './utils';
import cookieParser from 'cookie-parser';

export const createBasicApp = (): Express => {
    const app = express();
    app.use(cors({ credentials: true }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());

    return app;
};

export type ServerDependencies = QuizRouterDependencies &
    LessonRouterDependencies &
    AuthRouterDependencies;

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
    }

    private useRouters = () => {
        this.app.use(
            '/auth',
            createAuthRouter(this.config.authConfig, this.dependencies)
        );
        this.app.use('/lesson', createLessonRouter(this.dependencies));
        this.app.use('/quiz', createQuizRouter(this.dependencies));
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
