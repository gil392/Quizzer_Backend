import { Router } from "express";
import { QuestionsGenerator } from "../externalApis/quizGenerator";
import { LessonsDal } from "../lesson/dal";
import { QuizzesDal } from "./dal";
import * as handlers from "./handlers";

export type QuizRouterDependencies = {
  quizzesDal: QuizzesDal;
  lessonsDal: LessonsDal;
  questionsGenerator: QuestionsGenerator;
};

const createRouterController = ({
  quizzesDal,
  lessonsDal,
  questionsGenerator,
}: QuizRouterDependencies) => ({
  generateQuiz: handlers.generateQuiz(
    quizzesDal,
    lessonsDal,
    questionsGenerator
  ),
  submitQuiz: handlers.submitQuiz(quizzesDal),
  getQuizzesByLessonId: handlers.getQuizzesByLessonId(quizzesDal),
  deleteQuiz: handlers.deleteQuiz(quizzesDal),
});

export const createQuizRouter = (
  dependecies: QuizRouterDependencies
): Router => {
  const router = Router();
  const controller = createRouterController(dependecies);

  router.post("/", controller.generateQuiz);
  router.post("/submit", controller.submitQuiz);
  router.get("/lesson/:lessonId", controller.getQuizzesByLessonId);
  router.delete("/delete/:id", controller.deleteQuiz);
  return router;
};
