import { isNil } from "ramda";
import { validateAuthenticatedRequest } from "../authentication/validators";
import { UnauthorizedError } from "../services/server/exceptions";
import { UsersDal } from "../user/dal";
import { AchivementsProccesor } from "./toolkit/proccesor";
import { AchievementsDal } from "./dal";
import { Achievement } from "./types";
import {
  injectCompletedAchievmentItsProgress,
  isRequirementNotCompleted,
} from "./utils";

export const getAchievementProgress = (
  usersDal: UsersDal,
  achievmentsDal: AchievementsDal,
  achievmentsProccesor: AchivementsProccesor
) =>
  validateAuthenticatedRequest(async (req, res) => {
    const { id: userId } = req.user;

    const user = await usersDal.findUserWithoutAuthById(userId);
    if (isNil(user)) {
      throw new UnauthorizedError(`user ${userId} not found`);
    }

    const achievements = await achievmentsProccesor.getUserAchievementsProgress(
      user
    );
    const newCompletedAchievments = achievements
      .filter(
        (achievement) =>
          !achievement.requirements.some(isRequirementNotCompleted)
      )
      .map(({ _id }) => _id.toString());
    await usersDal.addCompletedAchievments(userId, newCompletedAchievments);

    const userAchievements: Achievement[] = user.achievements
      ? await achievmentsDal.getAchievementsByIds(user.achievements).lean()
      : [];

    const achievmentsWithProgress = achievements.concat(
      userAchievements.map(injectCompletedAchievmentItsProgress)
    );

    res.send(achievmentsWithProgress);
  });
