import { Types } from "mongoose";
import { mergeDeepRight } from "ramda";
import { Lesson } from "../../../lesson/model";
import { UserWithAuthentication } from "../../../user/model";
import {
  Achievement,
  LessonRequirement,
  Requirment,
  UserRequirement,
} from "../../types";

export const loggedUser: UserWithAuthentication = {
  _id: new Types.ObjectId(),
  email: "loggedUser@gmail.com",
  hashedPassword: "123456",
  lastQuizDate: new Date(),
  streak: 0,
  xp: 200,
  username: "logged-user",
  friends: ["friendOneId", "friendTwoId"],
};

const userCompletedRequirement: UserRequirement = {
  type: "user",
  condition: {
    values: {
      xp: 100,
    },
    count: 1,
  },
};

const userNotCompletedRequirement: UserRequirement = {
  type: "user",
  condition: {
    values: {
      xp: 500,
    },
    count: 1,
  },
};

const userNotCompletedArrayPropertyRequirement: UserRequirement = {
  type: "user",
  condition: {
    values: {
      friends: 10,
    },
    count: 1,
  },
};

const userCompletedArrayPropertyRequirement: UserRequirement = {
  type: "user",
  condition: {
    values: {
      friends: 1,
    },
    count: 1,
  },
};

const createTestAchievement = (
  requirements: Requirment[],
  achievement?: Partial<Achievement>
): Achievement =>
  mergeDeepRight(
    {
      _id: new Types.ObjectId(),
      description: "test achievement description",
      requirements,
      reward: {
        icon: "icon",
        xp: 500,
      },
      title: "test achievement",
    } satisfies Achievement,
    achievement ?? {}
  );

export const userCompletedAchievement = createTestAchievement(
  [userCompletedRequirement],
  {
    title: "user completed test achievement",
    description: "user completed test achievement description",
  }
);

export const userNotCompletedArrayPropertyAchievement = createTestAchievement(
  [userNotCompletedArrayPropertyRequirement],
  {
    title: "user not completed array property achievement",
    description: "user not completed array property achievement description",
  }
);

export const userCompletedArrayPropertyAchievement = createTestAchievement(
  [userCompletedArrayPropertyRequirement],
  {
    title: "user completed array property test achievement",
    description: "user completed array property test achievement description",
  }
);

export const userCompletedMultipleRequirementsAchievement =
  createTestAchievement(
    [userCompletedArrayPropertyRequirement, userCompletedRequirement],
    {
      title: "user completed multiple requirements test achievement",
      description:
        "user completed multiple requirements test achievement description",
    }
  );

export const userPartialCompletedMultipleRequirementsAchievement =
  createTestAchievement(
    [userNotCompletedArrayPropertyRequirement, userCompletedRequirement],
    {
      title: "user not completed multiple requirements test achievement",
      description:
        "user not completed multiple requirements test achievement description",
    }
  );

export const userNotCompletedMultipleRequirementsAchievement =
  createTestAchievement(
    [userNotCompletedArrayPropertyRequirement, userNotCompletedRequirement],
    {
      title: "user not completed multiple requirements test achievement",
      description:
        "user not completed multiple requirements test achievement description",
    }
  );

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

const lessonCompletedCountGreaterThanOneRequirement: LessonRequirement = {
  type: "lesson",
  condition: {
    values: {
      sharedUsers: 2,
    },
    count: 2,
  },
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

export const lessonCompletedAchievement = createTestAchievement(
  [lessonCompletedRequirement],
  {
    title: "lesson completed test achievement",
    description: "lesson completed test achievement description",
  }
);

export const lessonNotCompletedAchievement = createTestAchievement(
  [lessonNotCompletedRequirement],
  {
    title: "lesson not completed test achievement",
    description: "lesson not completed test achievement description",
  }
);

export const lessonCompletedCountGreaterThanOneAchievement =
  createTestAchievement([lessonCompletedCountGreaterThanOneRequirement], {
    title: "lesson completed count greater than one test achievement",
    description:
      "lesson completed count greater than one test achievement description",
  });
