import mongoose, { Connection } from 'mongoose';
import { lessonModel, LessonModel } from '../../lesson/model';
import { quizModel, QuizModel } from '../../quiz/model';
import { Service } from '../service';
import { DatabaseConfig } from './config';

type DatabaseModels = {
    quizModel: QuizModel;
    lessonModel: LessonModel;
};

export class Database extends Service {
    private connection: Connection;
    private models: DatabaseModels;

    constructor(private readonly config: DatabaseConfig) {
        super();
        this.connection = mongoose.connection;
        this.bindListenersOnConnection();

        this.models = {
            quizModel,
            lessonModel
        };
    }

    getModels = () => this.models;

    private bindListenersOnConnection = () => {
        this.connection.on('error', (error) => console.error(error));
        this.connection.once('open', () =>
            console.log('connected to database')
        );
        this.connection.once('close', () =>
            console.log('disconnected from database')
        );
    };

    async start() {
        const { connectionString } = this.config;
        await mongoose.connect(connectionString);
    }
    async stop() {
        await mongoose.disconnect();
    }
}
