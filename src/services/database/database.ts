import mongoose, { Connection } from "mongoose";
import { achievementModel, AchievementsModel } from "../../achivments/model";
import { QuizAttemptModel, quizAttemptModel } from "../../attempt/model";
import { lessonModel, LessonModel } from "../../lesson/model";
import { quizModel, QuizModel } from "../../quiz/model";
import { quizRatingModel, QuizRatingModel } from "../../quizRating/model";
import { UserModel, userModel } from "../../user/model";
import { Service } from "../service";
import { DatabaseConfig } from "./config";

type DatabaseModels = {
  quizModel: QuizModel;
  lessonModel: LessonModel;
  userModel: UserModel;
  quizRatingModel: QuizRatingModel;
  achievementModel: AchievementsModel;
  quizAttemptModel: QuizAttemptModel;
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
      lessonModel,
      userModel,
      quizRatingModel,
      achievementModel,
      quizAttemptModel,
    };
  }

  getModels = () => this.models;

  private bindListenersOnConnection = () => {
    this.connection.on("error", (error) => console.error(error));
    this.connection.once("open", () => console.log("connected to database"));
    this.connection.once("close", () =>
      console.log("disconnected from database")
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
