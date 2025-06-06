import { StatusCodes } from "http-status-codes";
import { isNil } from "ramda";
import { VideoSummeraizer } from "../externalApis/videoSummerizer";
import { BadRequestError, NotFoundError } from "../services/server/exceptions";
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
    const { videoUrl } = req.body;
    const { id: userId } = req.user;
    const videoId = extractVideoId(videoUrl);
    await createLessonFunc(userId, videoId, videoSummeraizer, lessonsDal, res);
  });

export const createRelatedLesson = (
  lessonsDal: LessonsDal,
  videoSummeraizer: VideoSummeraizer
) =>
  createRelatedLessonRequestValidator(async (req, res) => {
    const { videoId, relatedLessonId } = req.body;
    const { id: userId } = req.user;
    await createLessonFunc(
      userId,
      videoId,
      videoSummeraizer,
      lessonsDal,
      res,
      relatedLessonId
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

export const getLessons =
  (lessonsDal: LessonsDal) => async (req: any, res: any) => {
    const lessons = await lessonsDal.findAll();
    res.status(StatusCodes.OK).json(lessons);
  };

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

export const updateLesson = (lessonsDal: LessonsDal) =>
  updateLessonRequstValidator(async (req, res) => {
    const { id } = req.params;
    const { title, isFavorite, summary } = req.body;

    const updatedLesson = await lessonsDal.updateById(id, {
      title,
      isFavorite,
      summary,
    });

    if (isNil(updatedLesson)) {
      throw new NotFoundError(`Could not find lesson with id ${id}`);
    }

    res.status(StatusCodes.OK).json(updatedLesson.toObject());
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
  relatedLessonId?: string
) {
  const videoDetails = await getVideoDetails(videoId);

  if (isNil(videoDetails)) {
    throw new BadRequestError(
      `Could not find video details with id ${videoId}`
    );
  }

  const summary = await videoSummeraizer.summerizeVideo(videoId);

  const item: Partial<Lesson> = {
    owner: userId,
    sharedUsers: [],
    title: videoDetails.title ?? "Untitled",
    summary,
    videoDetails: { ...videoDetails, videoId },
  };

  if (relatedLessonId) {
    item.relatedLessonId = relatedLessonId;
  }
  const lesson = await lessonsDal.create(item);
  res.status(StatusCodes.CREATED).json(lesson.toObject());
}
