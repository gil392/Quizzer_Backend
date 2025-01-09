import express, { Express } from 'express';
import * as http from 'http';
import { Service } from '../service';
import { ServerConfig } from './config';

export class Server extends Service {
    app: Express;
    private server: http.Server;

    constructor(private readonly config: ServerConfig) {
        super();
        this.app = express();
        this.server = http.createServer(this.app);
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
