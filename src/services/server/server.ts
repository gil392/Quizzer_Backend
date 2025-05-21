import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Express } from "express";
import * as http from "http";
import swaggerUI from "swagger-ui-express";
import { injectUserToRequest } from "../../authentication/middlewares";
import {
  AuthRouterDependencies,
  createAuthRouter,
} from "../../authentication/router";
import {
    createLessonRouter,
    LessonRouterDependencies
} from '../../lesson/router';
import { createQuizRouter, QuizRouterDependencies } from '../../quiz/router';
import { createUsersRouter, UsersRouterDependencies } from '../../user/router';
import { Service } from '../service';
import { ServerConfig } from './config';
import { createSwaggerSpecs } from './swagger';
import { requestErrorHandler } from './utils';
import { AttemptRouterDependencies, createAttemptRouter } from '../../attempt/router';

export const createBasicApp = (corsOrigin?: string): Express => {
  const app = express();
  app.use(cors({ credentials: true, origin: corsOrigin }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  return app;
};

export type ServerDependencies = AttemptRouterDependencies &
    QuizRouterDependencies &
    LessonRouterDependencies &
    AuthRouterDependencies &
    UsersRouterDependencies;

export class Server extends Service {
  app: Express;
  private server: http.Server;

  constructor(
    private readonly dependencies: ServerDependencies,
    private readonly config: ServerConfig
  ) {
    super();
    this.app = createBasicApp(config.corsOrigin);
    this.useRouters();
    this.useErrorHandler();
    this.useSwagger();

    this.server = http.createServer(this.app);
  }

  private useRouters = () => {
    const { authConfig } = this.config;
    const authMiddleware = injectUserToRequest(authConfig.tokenSecret);

        this.app.use('/auth', createAuthRouter(authConfig, this.dependencies));
        this.app.use('/lesson', createLessonRouter(this.dependencies));
        this.app.use('/quiz', createQuizRouter(authMiddleware, this.dependencies));
        this.app.use('/attempt', createAttemptRouter(this.dependencies));
        this.app.use(
            '/user',
            createUsersRouter(authMiddleware, this.dependencies)
        );
    };

  private useErrorHandler = () => {
    this.app.use(requestErrorHandler);
  };

  private useSwagger = () => {
    const specs = createSwaggerSpecs(this.config);
    this.app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));
  };

  async start() {
    const { port } = this.config;

    return new Promise<void>((resolve, reject) => {
      this.server.listen(port, () => {
        console.log("server is running on port", port);
        resolve();
      });
      this.server.once("error", reject);
    });
  }

  async stop() {
    return new Promise<void>((resolve, reject) => {
      this.server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}
