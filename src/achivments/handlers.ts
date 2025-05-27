import { isNil } from "ramda";
import { validateAuthenticatedRequest } from "../authentication/validators";
import { LeanDocument } from "../services/database/types";
import { UnauthorizedError } from "../services/server/exceptions";
import { UsersDal } from "../user/dal";
import { AchivementsProccesor } from "./achivmentsProccesor/achivmentsProccesor";
import { AchievementsDal } from "./dal";
import { Achievement } from "./types";
import { injectCompletedAchievmentItsProgress } from "./utils";

export const getAchievementProgress = (
  usersDal: UsersDal,
  achievmentsDal: AchievementsDal,
  achievmentsProccesor: AchivementsProccesor
) =>
  validateAuthenticatedRequest(async (req, res) => {
    const { id: userId } = req.user;

    const user = await usersDal.findPublicUserById(userId);
    if (isNil(user)) {
      throw new UnauthorizedError(`user ${userId} not found`);
    }

    const achievements = await achievmentsProccesor.getUserAchievementsProgress(
      user
    );
    const newCompletedAchievments = achievements
      .filter(
        (achievement) =>
          !achievement.requirements.some(({ progress }) => progress !== 1)
      )
      .map(({ _id }) => _id.toString());
    await usersDal.addCompletedAchievments(userId, newCompletedAchievments);

    const userAchievements: LeanDocument<Achievement>[] = user.achievements
      ? await achievmentsDal.getAchievementsByIds(user.achievements).lean()
      : [];
      
    const achievmentsWithProgress = userAchievements
      .map(injectCompletedAchievmentItsProgress)
      .concat(achievements);

    res.send(achievmentsWithProgress);
  });
