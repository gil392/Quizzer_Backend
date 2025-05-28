import { Achievement, AchievementProgress, RequirmentProgress } from "./types";

export const injectCompletedAchievmentItsProgress = (
  achievment: Achievement
): AchievementProgress => {
  const { requirements } = achievment;
  const requirementsProgress: RequirmentProgress[] = requirements.map(
    ({ condition: { count } }) => ({ count, value: count })
  );

  return { ...achievment, requirements: requirementsProgress };
};

export const isRequirementNotCompleted = ({ value, count }: RequirmentProgress) =>
  value !== count;
