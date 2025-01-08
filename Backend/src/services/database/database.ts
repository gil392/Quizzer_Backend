import mongoose, { Connection } from 'mongoose';
import { Service } from '../service';
import { DatabaseConfig } from './config';

export class Database extends Service {
    private connection: Connection;

    constructor(private readonly config: DatabaseConfig) {
        super();
        this.connection = mongoose.connection;
        this.bindListenersOnConnection();
    }

    private bindListenersOnConnection = () => {
        this.connection.on('error', (error) => console.error(error));
        this.connection.once('open', () => console.log('connected to database'));
        this.connection.once('close', () => console.log('disconnected from database'));
    };

    async start() {
        const { connectionString } = this.config;
        await mongoose.connect(connectionString);
    }
    async stop() {
        await mongoose.disconnect();
    }
}
