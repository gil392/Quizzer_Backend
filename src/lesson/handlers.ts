import { StatusCodes } from "http-status-codes";
import { isNil } from "ramda";
import { VideoSummeraizer } from "../externalApis/videoSummerizer";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from "../services/server/exceptions";
import { LessonsDal } from "./dal";
import {
  createLessonRequstValidator,
  deleteLessonRequstValidator,
  getLessonByIdRequstValidator,
  updateLessonRequstValidator,
  relatedVideosLessonRequstValidator,
  createMergedLessonRequstValidator,
  createRelatedLessonRequestValidator,
} from "./validators";
import { extractVideoId } from "../externalApis/youtube/utils";
import { getVideoDetails } from "../externalApis/youtube/getVideoDetails";
import { Lesson, VideoDetails } from "./model";
import { getRelatedVideos } from "../externalApis/youtube/getRelatedVideos";
import { Response } from "express";
import { validateAuthenticatedRequest } from "../authentication/validators";
import { UsersDal } from "../user/dal";
import { AttemptDal } from "../attempt/dal";
import { QuizAttempt } from "../attempt/types";

export const getLessonById = (lessonsDal: LessonsDal) =>
  getLessonByIdRequstValidator(async (req, res) => {
    const { id } = req.params;
    const lesson = await lessonsDal.findById(id).lean();

    if (isNil(lesson)) {
      throw new NotFoundError(`could not find lesson with id ${id}`);
    }
    res.send(lesson);
  });

export const createLesson = (
  lessonsDal: LessonsDal,
  videoSummeraizer: VideoSummeraizer
) =>
  createLessonRequstValidator(async (req, res) => {
    const { videoUrl, relatedLessonGroupId } = req.body;
    const { id: userId } = req.user;
    const videoId = extractVideoId(videoUrl);
    await createLessonFunc(
      userId,
      videoId,
      videoSummeraizer,
      lessonsDal,
      res,
      relatedLessonGroupId ?? undefined
    );
  });

export const createMergedLesson = (lessonsDal: LessonsDal) =>
  createMergedLessonRequstValidator(async (req, res) => {
    const { lessonIds, title } = req.body;
    const { id: userId } = req.user;

    const lessons = await lessonsDal.findByIds(lessonIds);

    if (lessons.length !== lessonIds.length) {
      throw new NotFoundError("One or more lessons not found");
    }

    const mergedSummary = lessons.map((lesson) => lesson.summary).join("\n\n");

    const newLesson = await lessonsDal.create({
      owner: userId,
      sharedUsers: [],
      title:
        title ?? "Merged Lessons: " + lessons.map((l) => l.title).join(", "),
      summary: mergedSummary,
    });

    res.status(StatusCodes.CREATED).json(newLesson.toObject());
  });

export const getLessons = (
  lessonsDal: LessonsDal,
  usersDal: UsersDal,
  attemptDal: AttemptDal
) =>
  validateAuthenticatedRequest(async (req, res) => {
    const { id: userId } = req.user;
    const lessons = await lessonsDal.findByUser(userId);
    const user = await usersDal.findById(userId);
    if (isNil(user)) {
      throw new NotFoundError("User not found");
    }

    const lessonsWithSuccessRates = await Promise.all(
      lessons.map(async (lesson) => {
        const attempts = await attemptDal.findByLessonAndUser(
          lesson.toObject()._id.toString(),
          userId
        );
        const grades = attempts.map((a) => getGrade(a));

        const successRate =
          grades.length === 0
            ? undefined
            : Math.round(
                (grades.filter((passedGrade) => passedGrade >= 60).length /
                  grades.length) *
                  100
              );
        return {
          ...lesson.toObject(),
          successRate,
        };
      })
    );

    const lessonsWithFavorite = lessonsWithSuccessRates.map((lesson) => ({
      ...lesson,
      isFavorite: user
        .toObject()
        .favoriteLessons?.some(
          (lessonId) => lessonId === lesson._id.toString()
        ),
    }));

    res.status(StatusCodes.OK).json(lessonsWithFavorite);
  });

export const deleteLesson = (lessonsDal: LessonsDal) =>
  deleteLessonRequstValidator(async (req, res) => {
    const { id } = req.params;

    const result = await lessonsDal.deleteById(id);

    if (isNil(result)) {
      throw new NotFoundError(`Could not find lesson with id ${id}`);
    }
    res
      .status(StatusCodes.OK)
      .send({ message: `Lesson with id ${id} deleted successfully.` });
  });

export const updateLesson = (lessonsDal: LessonsDal, usersDal: UsersDal) =>
  updateLessonRequstValidator(async (req, res) => {
    const { id } = req.params;
    const { title, isFavorite, summary } = req.body;
    const { id: userId } = req.user;

    const updatedLesson = await lessonsDal.updateById(id, {
      title,
      summary,
    });

    if (isNil(updatedLesson)) {
      throw new NotFoundError(`Could not find lesson with id ${id}`);
    }

    const user = await usersDal.findById(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const update = isFavorite
      ? { $addToSet: { favoriteLessons: id } }
      : { $pull: { favoriteLessons: id } };

    const updatedUserWithFavorite = await usersDal.updateByIdWithSet(
      userId,
      update
    );

    if (isNil(updatedUserWithFavorite)) {
      throw new InternalServerError("Failed to update lesson"); //todo: add to swagger doc
    }

    res
      .status(StatusCodes.OK)
      .json({ ...updatedLesson.toObject(), isFavorite });
  });

export const getRelatedVideosForLesson = (lessonsDal: LessonsDal) =>
  relatedVideosLessonRequstValidator(async (req, res) => {
    const { id } = req.query;

    const lesson = await lessonsDal.findById(id).lean();
    if (isNil(lesson)) {
      throw new NotFoundError(`Could not find lesson with id ${id}`);
    }

    const { videoDetails, summary } = lesson;

    if (!videoDetails) {
      throw new BadRequestError("Lesson does not have video details.");
    }

    const relatedVideos = await getRelatedVideos(
      videoDetails.videoId,
      videoDetails,
      summary
    );

    res.status(StatusCodes.OK).json(relatedVideos);
  });

async function createLessonFunc(
  userId: string,
  videoId: string,
  videoSummeraizer: VideoSummeraizer,
  lessonsDal: LessonsDal,
  res: Response,
  relatedLessonGroupId?: string
) {
  const videoDetails = await getVideoDetails(videoId);

  if (isNil(videoDetails)) {
    throw new BadRequestError(
      `Could not find video details with id ${videoId}`
    );
  }

  const summary = await videoSummeraizer.summerizeVideo(videoId);
  if (!summary) {
    throw new InternalServerError("Failed to generate summary for the video.");
  }
  const item: Partial<Lesson> = {
    owner: userId,
    sharedUsers: [],
    title: videoDetails.title ?? "Untitled",
    summary,
    videoDetails: { ...videoDetails, videoId },
  };

  if (relatedLessonGroupId) {
    item.relatedLessonGroupId = relatedLessonGroupId;
  }
  const lesson = await lessonsDal.create(item);
  res.status(StatusCodes.CREATED).json(lesson.toObject());
}

const getGrade = (attempt: QuizAttempt): number => {
  const total = attempt.results.length;
  if (total === 0) return 0;

  const correct = attempt.results.filter((r) => r.isCorrect).length;
  return (correct / total) * 100;
};
