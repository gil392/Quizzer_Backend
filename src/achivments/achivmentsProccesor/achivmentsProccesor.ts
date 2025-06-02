import { InternalServerError } from "../../services/server/exceptions";
import { User } from "../../user/model";
import {
  Achievement,
  AchievementProgress,
  AchievementsProccesorDependancies,
  Requirement,
  RequirementProgress,
  UserRequirement,
} from "../types";
import { isAllRequirementsCompleted } from "../utils";
import {
  checkLessonRequirement,
  checkQuizAttemptRequirement,
  checkUserRequirement,
} from "./utils";

export class AchivementsProccesor {
  constructor(
    private readonly dependancies: AchievementsProccesorDependancies
  ) {}

  getAchievmentProgress = async (
    user: User,
    achievment: Achievement
  ): Promise<AchievementProgress> => {
    const { lessonsDal, attemptDal: quizAttemptsDal } = this.dependancies;
    const { requirements } = achievment;

    const progressesPromises = requirements.map(
      ({ type, condition }): Promise<RequirementProgress> => {
        switch (type) {
          case "user":
            return checkUserRequirement(user, condition);
          case "lesson":
            return checkLessonRequirement(
              lessonsDal,
              user._id.toString(),
              condition
            );
          case "quizAttempt":
            return checkQuizAttemptRequirement(
              quizAttemptsDal,
              user._id.toString(),
              condition
            );
          default:
            throw new InternalServerError(
              `achievement requirement type is invalid: { requirement.type: ${type}, achievementId: ${achievment._id} }`
            );
        }
      }
    );
    const requirementsProgresses = await Promise.all(progressesPromises);

    return {
      ...achievment,
      requirements: requirementsProgresses,
      isCompleted: isAllRequirementsCompleted(requirementsProgresses),
    };
  };

  getUserAchievementsProgress = async (
    user: User
  ): Promise<AchievementProgress[]> => {
    const { achievementsDal } = this.dependancies;

    const achievments = await achievementsDal
      .getAvaliableAchievments(user.achievements ?? [])
      .lean();
    const achievmentsWithProgress = await Promise.all(
      achievments.map((achievment) =>
        this.getAchievmentProgress(user, achievment)
      )
    );

    return achievmentsWithProgress;
  };
}
