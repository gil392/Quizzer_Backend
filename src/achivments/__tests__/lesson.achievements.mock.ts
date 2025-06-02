import { Lesson } from "../../lesson/model";
import {
  AchievementProgress,
  LessonRequirement,
  RequirementProgress,
} from "../types";
import { loggedUser } from "./mocks";
import { createAchievementMock } from "./utils";

export const loggedUserLessons: Lesson[] = [
  {
    owner: loggedUser._id.toString(),
    sharedUsers: ["user1", "user2"],
    summary: "summary2",
    title: "title2",
    videoDetails: {
      channel: "channel2",
      channelId: "channelId2",
      description: "description2",
      duration: "15m",
      title: "title2",
      videoId: "1324245",
      views: "9",
    },
  },
  {
    owner: loggedUser._id.toString(),
    sharedUsers: ["user2", "user3", "user4"],
    summary: "summary3",
    title: "title3",
    videoDetails: {
      channel: "channel3",
      channelId: "channelId3",
      description: "description3",
      duration: "35m",
      title: "title3",
      videoId: "3324245",
      views: "9",
    },
  },
];

const lessonCompletedRequirement: LessonRequirement = {
  type: "lesson",
  condition: {
    values: {
      sharedUsers: 1,
    },
    count: 1,
  },
};
const lessonCompletedRequirementProgress: RequirementProgress = {
  value: 2,
  count: 1,
};

const lessonCompletedCountGreaterThanOneRequirement: LessonRequirement = {
  type: "lesson",
  condition: {
    values: {
      sharedUsers: 2,
    },
    count: 2,
  },
};
const lessonCompletedCountGreaterThanOneRequirementProgress: RequirementProgress =
  {
    value: 2,
    count: 2,
  };

const lessonNotCompletedRequirement: LessonRequirement = {
  type: "lesson",
  condition: {
    values: {
      sharedUsers: 4,
    },
    count: 1,
  },
};
const lessonNotCompletedRequirementProgress: RequirementProgress = {
  value: 0,
  count: 1,
};

export const lessonCompletedAchievement = createAchievementMock(
  [lessonCompletedRequirement],
  {
    title: "lesson completed test achievement",
    description: "lesson completed test achievement description",
  }
);
const lessonCompletedAchievementProgress: AchievementProgress = {
  ...lessonCompletedAchievement,
  requirements: [lessonCompletedRequirementProgress],
  isCompleted: true,
};

export const lessonNotCompletedAchievement = createAchievementMock(
  [lessonNotCompletedRequirement],
  {
    title: "lesson not completed test achievement",
    description: "lesson not completed test achievement description",
  }
);
const lessonNotCompletedAchievementProgress: AchievementProgress = {
  ...lessonNotCompletedAchievement,
  requirements: [lessonNotCompletedRequirementProgress],
  isCompleted: false,
};

export const lessonCompletedCountGreaterThanOneAchievement =
  createAchievementMock([lessonCompletedCountGreaterThanOneRequirement], {
    title: "lesson completed count greater than one test achievement",
    description:
      "lesson completed count greater than one test achievement description",
  });
const lessonCompletedCountGreaterThanOneAchievementProgress: AchievementProgress =
  {
    ...lessonCompletedCountGreaterThanOneAchievement,
    requirements: [lessonCompletedCountGreaterThanOneRequirementProgress],
    isCompleted: true,
  };

export const loggedUserExpectedLessonsAchievementsProgresses = [
  lessonCompletedAchievementProgress,
  lessonNotCompletedAchievementProgress,
  lessonCompletedCountGreaterThanOneAchievementProgress,
];
export const lessonAchievementsMock = [
  lessonCompletedAchievement,
  lessonNotCompletedAchievement,
  lessonCompletedCountGreaterThanOneAchievement,
];
