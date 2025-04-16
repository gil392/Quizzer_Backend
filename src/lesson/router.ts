import { Router } from "express";
import { VideoSummeraizer } from "../externalApis/videoSummerizer";
import { LessonsDal } from "../lesson/dal";
import * as handlers from "./handlers";
import { get } from "http";

export type LessonRouterDependencies = {
  lessonsDal: LessonsDal;
  videoSummeraizer: VideoSummeraizer;
};

const createRouterController = ({
  lessonsDal,
  videoSummeraizer,
}: LessonRouterDependencies) => ({
  createLesson: handlers.createLesson(lessonsDal, videoSummeraizer),
  getLessonById: handlers.getLessonById(lessonsDal),
  getLessons: handlers.getLessons(lessonsDal),
  deleteLesson: handlers.deleteLesson(lessonsDal),
  updateLesson: handlers.updateLesson(lessonsDal),
});

export const createLessonRouter = (
  dependecies: LessonRouterDependencies
): Router => {
  const router = Router();
  const controller = createRouterController(dependecies);

  router.get("/:id", controller.getLessonById);
  router.post("/", controller.createLesson);
  router.get("/", controller.getLessons);
  router.delete("/delete/:id", controller.deleteLesson);
  router.put("/updateLesson/:id", controller.updateLesson);

  return router;
};
