import { Database } from '../database/database';
import { Server } from '../server/server';
import { Service } from '../service';
import { SystemConfig } from './config';

export class System extends Service {
    private readonly database: Database;
    private readonly server: Server;

    constructor(config: SystemConfig) {
        super();
        const { databaseConfig, serverConfig } = config;

        this.database = new Database(databaseConfig);
        this.server = new Server(serverConfig);
    }

    async start() {
        await this.database.start();
        await this.server.start();
    }

    async stop() {
        await this.server.stop();
        await this.database.stop();
    }
}
