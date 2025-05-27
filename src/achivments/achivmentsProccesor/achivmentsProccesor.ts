import { User } from "../../user/model";
import {
  Achievement,
  AchievementProgress,
  AchievementsProccesorDependancies,
} from "../types";
import { checkLessonRequirement, checkUserRequirement } from "./utils";

export class AchivementsProccesor {
  constructor(
    private readonly dependancies: AchievementsProccesorDependancies
  ) {}

  private getAchievmentProgress = async (
    user: User,
    achievment: Achievement
  ): Promise<AchievementProgress> => {
    const { lessonsDal } = this.dependancies;
    const { requirements } = achievment;

    const progressesPromises = requirements.map(async ({ type, condition }) => {
      const progress =
        type === "user"
          ? await checkUserRequirement(user, condition)
          : await checkLessonRequirement(
              lessonsDal,
              user._id.toString(),
              condition
            );

      return { count: condition.count, progress };
    });
    const requirementsProgresses = await Promise.all(progressesPromises);

    return { ...achievment, requirements: requirementsProgresses };
  };

  getUserAchievementsProgress = async (
    user: User
  ): Promise<AchievementProgress[]> => {
    const { achievmentsDal } = this.dependancies;

    const achievments = await achievmentsDal
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
