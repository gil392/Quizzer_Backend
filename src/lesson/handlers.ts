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
  relatedVideosLessonRequstValidator
} from "./validators";
import { extractVideoId } from "../externalApis/youtube/utils";
import { getVideoDetails } from "../externalApis/youtube/getVideoDetails";
import { VideoDetails } from "./model";
import { getRelatedVideos } from "../externalApis/youtube/getRelatedVideos";

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
    const videoId = extractVideoId(videoUrl);
    const videoDetails = { ...await getVideoDetails(videoId), videoId };

    const summary = await videoSummeraizer.summerizeVideo(videoId);

    const lesson = await lessonsDal.create({
      owner: "owner Mock", // TODO: use logged user after auth
      sharedUsers: [],
      title: videoDetails.title ?? "Untitled",
      summary,
      videoDetails: videoDetails as VideoDetails
    });
    res.status(StatusCodes.CREATED).json(lesson.toObject());
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
    const { title, summary } = req.body;

    const updatedLesson = await lessonsDal.updateById(id, {
      title,
      summary,
    });

    if (isNil(updatedLesson)) {
      throw new NotFoundError(`Could not find lesson with id ${id}`);
    }

    res.status(StatusCodes.OK).json(updatedLesson.toObject());
  });


export const getRelatedVideosForLesson = (lessonsDal: LessonsDal) =>
  relatedVideosLessonRequstValidator(async (req, res) => {
    const { id } = req.params;

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