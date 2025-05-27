import { Achievement, AchievementProgress, RequirmentProgress } from "./types";

export const injectCompletedAchievmentItsProgress = (
  achievment: Achievement
): AchievementProgress => {
  const { requirements } = achievment;
  const requirementsProgress: RequirmentProgress[] = requirements.map(
    ({ condition: { count } }) => ({ count, progress: 1 })
  );

  return { ...achievment, requirements: requirementsProgress };
};
