import { min } from "ramda";
import { User } from "../../user/model";
import {
  Achievement,
  AchievementProgress,
  AchievementsProccesorDependancies,
  RequirementProgress,
} from "../types";
import { isAllRequirementsCompleted } from "../utils";
import { checkLessonRequirement, checkUserRequirement } from "./utils";

export class AchivementsProccesor {
  constructor(
    private readonly dependancies: AchievementsProccesorDependancies
  ) {}

  getAchievmentProgress = async (
    user: User,
    achievment: Achievement
  ): Promise<AchievementProgress> => {
    const { lessonsDal } = this.dependancies;
    const { requirements } = achievment;

    const progressesPromises = requirements.map(
      ({ type, condition }): Promise<RequirementProgress> =>
        type === "user"
          ? checkUserRequirement(user, condition)
          : checkLessonRequirement(lessonsDal, user._id.toString(), condition)
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
