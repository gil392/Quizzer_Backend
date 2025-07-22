import { AttemptDal } from "../attempt/dal";
import { QuizAttempt } from "../attempt/types";
import { LessonsDal } from "../lesson/dal";
import { Lesson } from "../lesson/model";
import { LeanDocument } from "../services/database/types";
import { User } from "../user/model";
import { AchievementsDal } from "./dal";

export type Condition<T extends {}> = {
  values: Partial<Record<keyof T, number>>;
  count: number;
};

type RequirmentOf<Type, ConditionOf extends {}> = {
  type: Type;
  condition: Condition<ConditionOf>;
};

export type LessonRequirement = RequirmentOf<"lesson", Lesson>;
export type QuizAttemptReuirement = RequirmentOf<"quizAttempt", QuizAttempt>;
export type UserRequirement = RequirmentOf<"user", User>;

export type Requirement =
  | UserRequirement
  | LessonRequirement
  | QuizAttemptReuirement;

type Reward = {
  icon: string;
  xp: number;
};

export type Achievement = LeanDocument<{
  title: string;
  description: string;
  reward: Reward;
  requirements: Requirement[];
  sharedUsers: string[];
  achivmentLock?: string;
}>;

export type RequirementProgress = { count: number; value: number };
export type AchievementProgress = Omit<Achievement, "requirements"> & {
  requirements: RequirementProgress[];
  isCompleted: boolean;
};

export type AchievementsProccesorDependancies = {
  achievementsDal: AchievementsDal;
  attemptDal: AttemptDal;
  lessonsDal: LessonsDal;
};
