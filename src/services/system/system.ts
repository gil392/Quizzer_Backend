import { AchivementsProccesor } from "../../achivments/toolkit/proccesor";
import { AchievementsDal } from "../../achivments/dal";
import { AttemptDal } from "../../attempt/dal";
import { QuestionsGenerator } from "../../externalApis/quizGenerator";
import { VideoSummeraizer } from "../../externalApis/videoSummerizer";
import { LessonsDal } from "../../lesson/dal";
import { QuizzesDal } from "../../quiz/dal";
import { QuizzesRatingDal } from "../../quizRating/dal";
import { UsersDal } from "../../user/dal";
import { Database } from "../database/database";
import { Server } from "../server/server";
import { Service } from "../service";
import { SystemConfig } from "./config";
import { seedAchievements } from "../../achivments/toolkit/seeder";

export class System extends Service {
  private readonly database: Database;
  private readonly server: Server;
  private achievementsDal: AchievementsDal;

  constructor(config: SystemConfig) {
    super();
    const { databaseConfig, serverConfig, openAiConfig } = config;

    this.database = new Database(databaseConfig);
    const dals = this.createDals();
    this.achievementsDal = dals.achievementsDal;
    const questionsGenerator = new QuestionsGenerator(openAiConfig);
    const videoSummeraizer = new VideoSummeraizer(openAiConfig);
    const achievementsProccesor = new AchivementsProccesor({ ...dals });

    this.server = new Server(
      { ...dals, questionsGenerator, videoSummeraizer, achievementsProccesor },
      serverConfig
    );
  }

  private createDals = () => {
    const {
      quizModel,
      lessonModel,
      userModel,
      quizRatingModel,
      achievementModel,
      quizAttemptModel,
    } = this.database.getModels();

    const quizzesDal = new QuizzesDal(quizModel);
    const lessonsDal = new LessonsDal(lessonModel);
    const usersDal = new UsersDal(userModel);
    const attemptDal = new AttemptDal(quizAttemptModel);
    const quizzesRatingDal = new QuizzesRatingDal(quizRatingModel);
    const achievementsDal = new AchievementsDal(achievementModel);

    return {
      quizzesDal,
      lessonsDal,
      usersDal,
      attemptDal,
      quizzesRatingDal,
      achievementsDal,
    };
  };

  async start() {
    await this.database.start();
    await seedAchievements(this.achievementsDal);
    await this.server.start();
  }

  async stop() {
    await this.server.stop();
    await this.database.stop();
  }
}
