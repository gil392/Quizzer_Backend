import { Achievement, AchievementProgress, RequirmentProgress } from "./types";

export const injectCompletedAchievmentItsProgress = (
  achievment: Achievement
): AchievementProgress => {
  const { requirements } = achievment;
  const requirementsProgress: RequirmentProgress[] = requirements.map(
    ({ condition: { count } }) => ({ count, value: count })
  );

  return {
    ...achievment,
    requirements: requirementsProgress,
    isCompleted: true,
  };
};

export const isRequirementNotCompleted = ({
  value,
  count,
}: RequirmentProgress) => value !== count;

export const isAllRequirementsCompleted = (
  requiremens: RequirmentProgress[]
): boolean => !requiremens.some(isRequirementNotCompleted);
