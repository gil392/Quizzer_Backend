import { Achievement, AchievementProgress, RequirementProgress } from "./types";

export const injectCompletedAchievmentItsProgress = (
  achievment: Achievement
): AchievementProgress => {
  const { requirements } = achievment;
  const requirementsProgress: RequirementProgress[] = requirements.map(
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
}: RequirementProgress) => value < count;

export const isAllRequirementsCompleted = (
  requiremens: RequirementProgress[]
): boolean => !requiremens.some(isRequirementNotCompleted);
