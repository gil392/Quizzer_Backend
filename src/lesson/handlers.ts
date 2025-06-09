import { StatusCodes } from "http-status-codes";
import { isNil } from "ramda";
import { VideoSummeraizer } from "../externalApis/videoSummerizer";
import { BadRequestError, InternalServerError, NotFoundError } from "../services/server/exceptions";
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

export const getLessons =
  (lessonsDal: LessonsDal) => validateAuthenticatedRequest(async (req, res) => {
    const user = req.user;
    const lessons = await lessonsDal.findByUser(user.id);
    res.status(StatusCodes.OK).json(lessons);
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
