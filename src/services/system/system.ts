import { QuestionsGenerator } from '../../externalApis/quizGenerator';
import { Summarizer } from '../../externalApis/transcriptSummarizer/transcriptSummarizer';
import { LessonsDal } from '../../lesson/dal';
import { QuizzesDal } from '../../quiz/dal';
import { Database } from '../database/database';
import { Server } from '../server/server';
import { Service } from '../service';
import { SystemConfig } from './config';

export class System extends Service {
    private readonly database: Database;
    private readonly server: Server;

    constructor(config: SystemConfig) {
        super();
        const { databaseConfig, serverConfig, summarizerConfig } = config;

        this.database = new Database(databaseConfig);
        const dals = this.createDals();
        const questionsGenerator = new QuestionsGenerator();
        const transcriptSummarizer = new Summarizer(summarizerConfig);
        this.server = new Server(
            { ...dals, questionsGenerator, transcriptSummarizer },
            serverConfig
        );
    }

    private createDals = () => {
        const { quizModel, lessonModel } = this.database.getModels();
        const quizzesDal = new QuizzesDal(quizModel);
        const lessonsDal = new LessonsDal(lessonModel);

        return {
            quizzesDal,
            lessonsDal
        };
    };

    async start() {
        await this.database.start();
        await this.server.start();
    }

    async stop() {
        await this.server.stop();
        await this.database.stop();
    }
}
