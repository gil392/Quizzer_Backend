import { isNil } from "ramda";
import { LeanDocument } from "../../services/database/types";
import { BadRequestError } from "../../services/server/exceptions";
import { PublicUser } from "../../user/model";
import { Achievement, AchievementsProccesorDependancies } from "../types";
import { checkLessonRequirement, checkUserRequirement } from "./utils";

export class AchivementsProccesor {
  constructor(
    private readonly dependancies: AchievementsProccesorDependancies
  ) {}

  private getAchievmentProgress = async (
    user: LeanDocument<PublicUser>,
    achievment: LeanDocument<Achievement>
  ) => {
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

    return await Promise.all(progressesPromises);
  };

  getUserAchievementsProgress = async (user: LeanDocument<PublicUser>) => {
    const { achievmentsDal } = this.dependancies;

    if (isNil(user)) {
      throw new BadRequestError("user in not find to check his achievments");
    }

    const achievments = await achievmentsDal.getAvaliableAchievments([]);
    const achievmentsWithProgress = await Promise.all(
      achievments.map(async (achievment) => {
        const progress = await this.getAchievmentProgress(user, achievment);

        return { ...achievment, requirements: progress };
      })
    );

    return achievmentsWithProgress;
  };
}
