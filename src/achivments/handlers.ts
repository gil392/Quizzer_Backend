import { isNil } from "ramda";
import * as path from "path";
import * as fs from "fs/promises";
import { UnauthorizedError } from "../services/server/exceptions";
import { UsersDal } from "../user/dal";
import { AchivementsProccesor } from "./toolkit/proccesor";
import { AchievementsDal } from "./dal";
import { Achievement } from "./types";
import {
  injectCompletedAchievmentItsProgress,
  isRequirementNotCompleted,
} from "./utils";
import { validateAchievementImageRequest, validateAchievementProgressRequest } from "./validators";

export const getAchievementProgress = (
  usersDal: UsersDal,
  achievmentsDal: AchievementsDal,
  achievmentsProccesor: AchivementsProccesor
) =>
  validateAchievementProgressRequest(async (req, res) => {
    const { id: userId } = req.user;
    const { friendId } = req.query;

    const targetUserId = friendId || userId;

    const user = await usersDal.findUserWithoutAuthById(targetUserId);
    if (isNil(user)) {
      throw new UnauthorizedError(`user ${targetUserId} not found`);
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
    await usersDal.addCompletedAchievments(targetUserId, newCompletedAchievments);

    const userAchievements: Achievement[] = user.achievements
      ? await achievmentsDal.getAchievementsByIds(user.achievements).lean()
      : [];

    const achievmentsWithProgress = achievements.concat(
      userAchievements.map(injectCompletedAchievmentItsProgress)
    );

    res.send(achievmentsWithProgress);
  });

export const getAchievementImage = (
  achievementsDal: AchievementsDal
) =>
  validateAchievementImageRequest(async (req, res) => {
    const { id } = req.params;

    try {
      const achievement = await achievementsDal.getAchievementsByIds([id]);

      if (!achievement || achievement.length === 0) {
        res.status(404).json({ message: "Achievement not found" });
        return; 
      }

      const iconPath = achievement[0].reward.icon;

      const baseDir = path.resolve(__dirname, "../../../Backend_Quizzer/src"); 
      const fullPath = path.join(baseDir, iconPath);
      
      try {
        await fs.access(fullPath); 
      } catch {
        res.status(404).json({ message: "Achievement image not found" });
        return; 
      }

      res.sendFile(fullPath);
    } catch (error) {
      console.error("Error fetching achievement image:", error);
      res.status(500).json({ message: "Server error" });
    }
  });