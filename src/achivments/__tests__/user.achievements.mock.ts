import {
    AchievementProgress,
    RequirementProgress,
    UserRequirement,
} from "../types";
import { createAchievementMock } from "./utils";

const userCompletedRequirement: UserRequirement = {
  type: "user",
  condition: {
    values: {
      xp: 100,
    },
    count: 1,
  },
};
const userCompletedRequirementProgress: RequirementProgress = {
  value: 200,
  count: 100,
};

export const userCompletedAchievement = createAchievementMock(
  [userCompletedRequirement],
  {
    title: "user completed test achievement",
    description: "user completed test achievement description",
  }
);
const userCompletedAchievementProgress: AchievementProgress = {
  ...userCompletedAchievement,
  requirements: [userCompletedRequirementProgress],
  isCompleted: true,
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
const userNotCompletedRequirementProgress: RequirementProgress = {
  value: 200,
  count: 500,
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
const userNotCompletedArrayPropertyRequirementProgress: RequirementProgress = {
  value: 2,
  count: 10,
};

export const userNotCompletedArrayPropertyAchievement = createAchievementMock(
  [userNotCompletedArrayPropertyRequirement],
  {
    title: "user not completed array property achievement",
    description: "user not completed array property achievement description",
  }
);
const userNotCompletedArrayPropertyAchievementProgress: AchievementProgress = {
  ...userNotCompletedArrayPropertyAchievement,
  requirements: [userNotCompletedArrayPropertyRequirementProgress],
  isCompleted: false,
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
const userCompletedArrayPropertyRequirementProgress: RequirementProgress = {
  value: 2,
  count: 1,
};

export const userCompletedArrayPropertyAchievement = createAchievementMock(
  [userCompletedArrayPropertyRequirement],
  {
    title: "user completed array property test achievement",
    description: "user completed array property test achievement description",
  }
);
const userCompletedArrayPropertyAchievementProgress: AchievementProgress = {
  ...userCompletedArrayPropertyAchievement,
  requirements: [userCompletedArrayPropertyRequirementProgress],
  isCompleted: true,
};

export const userCompletedMultipleRequirementsAchievement =
  createAchievementMock(
    [userCompletedArrayPropertyRequirement, userCompletedRequirement],
    {
      title: "user completed multiple requirements test achievement",
      description:
        "user completed multiple requirements test achievement description",
    }
  );
const userCompletedMultipleRequirementsAchievementProgress: AchievementProgress =
  {
    ...userCompletedMultipleRequirementsAchievement,
    requirements: [
      userCompletedArrayPropertyRequirementProgress,
      userCompletedRequirementProgress,
    ],
    isCompleted: true,
  };

export const userPartialCompletedMultipleRequirementsAchievement =
  createAchievementMock(
    [userNotCompletedArrayPropertyRequirement, userCompletedRequirement],
    {
      title: "user partial completed multiple requirements test achievement",
      description:
        "user partial completed multiple requirements test achievement description",
    }
  );
const userPartialCompletedMultipleRequirementsAchievementProgress: AchievementProgress =
  {
    ...userPartialCompletedMultipleRequirementsAchievement,
    requirements: [
      userNotCompletedArrayPropertyRequirementProgress,
      userCompletedRequirementProgress,
    ],
    isCompleted: false,
  };

export const userNotCompletedMultipleRequirementsAchievement =
  createAchievementMock(
    [userNotCompletedArrayPropertyRequirement, userNotCompletedRequirement],
    {
      title: "user not completed multiple requirements test achievement",
      description:
        "user not completed multiple requirements test achievement description",
    }
  );
const userNotCompletedMultipleRequirementsAchievementProgress: AchievementProgress =
  {
    ...userNotCompletedMultipleRequirementsAchievement,
    requirements: [
      userNotCompletedArrayPropertyRequirementProgress,
      userNotCompletedRequirementProgress,
    ],
    isCompleted: false,
  };

export const loggedUserExpectedUserAchievementsProgresses = [
  userCompletedAchievementProgress,
  userNotCompletedArrayPropertyAchievementProgress,
  userCompletedArrayPropertyAchievementProgress,
  userCompletedMultipleRequirementsAchievementProgress,
  userPartialCompletedMultipleRequirementsAchievementProgress,
  userNotCompletedMultipleRequirementsAchievementProgress,
];
export const userAchievementsMock = [
  userCompletedAchievement,
  userNotCompletedArrayPropertyAchievement,
  userCompletedArrayPropertyAchievement,
  userCompletedMultipleRequirementsAchievement,
  userPartialCompletedMultipleRequirementsAchievement,
  userNotCompletedMultipleRequirementsAchievement,
];
