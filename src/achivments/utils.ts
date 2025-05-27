import { LeanDocument } from "../services/database/types";
import { Achievement, AchievementProgress, RequirmentProgress } from "./types";

export const injectCompletedAchievmentItsProgress = (
  achievment: LeanDocument<Achievement>
): LeanDocument<AchievementProgress> => {
  const { requirements } = achievment;
  const requirementsProgress: RequirmentProgress[] = requirements.map(
    ({ condition: { count } }) => ({ count, progress: 1 })
  );

  return { ...achievment, requirements: requirementsProgress };
};
