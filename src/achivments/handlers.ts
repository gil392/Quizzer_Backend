import { isNil } from "ramda";
import { validateAuthenticatedRequest } from "../authentication/validators";
import { UnauthorizedError } from "../services/server/exceptions";
import { UsersDal } from "../user/dal";
import { AchivementsProccesor } from "./achivmentsProccesor/achivmentsProccesor";

export const getAchievementProgress = (
  usersDal: UsersDal,
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

    res.send(achievements);
  });
