import { BasicDal } from "../services/database/base.dal";
import { Achievement } from "./types";

export class AchievementsDal extends BasicDal<Achievement> {
  getAvaliableAchievments = (completedAchievements: string[]) =>
    this.model.find({
      _id: { $nin: completedAchievements },
      $or: [
        { achievementLock: { $exists: false } },
        { achievementLock: { $in: completedAchievements } },
      ],
    });

  getAchievementsByIds = (achievements: string[]) =>
    this.model.find({ _id: { $in: achievements } });
}
