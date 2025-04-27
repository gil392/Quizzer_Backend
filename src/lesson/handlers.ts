import { StatusCodes } from "http-status-codes";
import { isNil } from "ramda";
import { VideoSummeraizer } from "../externalApis/videoSummerizer";
import { NotFoundError } from "../services/server/exceptions";
import { LessonsDal } from "./dal";
import {
  createLessonRequstValidator,
  deleteLessonRequstValidator,
  getLessonByIdRequstValidator,
  updateLessonRequstValidator,
} from "./validators";
import { extractVideoId } from "../externalApis/youtube/utils";
import { getVideoDetails } from "../externalApis/youtube/getVideoDetails";

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
    const videoDetails = await getVideoDetails(videoId);
    const summary = await videoSummeraizer.summerizeVideo(videoId);

    const lesson = await lessonsDal.create({
      owner: "owner Mock", // TODO: use logged user after auth
      sharedUsers: [],
      summary,
      title: videoDetails?.title ?? "",
      videoUrl,
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
    const { title, summary, videoUrl } = req.body;

    const updatedLesson = await lessonsDal.updateById(id, {
      title,
      summary,
      videoUrl,
    });

    if (isNil(updatedLesson)) {
      throw new NotFoundError(`Could not find lesson with id ${id}`);
    }

    res.status(StatusCodes.OK).json(updatedLesson.toObject());
  });
