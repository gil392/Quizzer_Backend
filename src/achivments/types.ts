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
// export type AttempsReuirements = RequirmentOf<'attempt', Attempt>;
export type UserRequirement = RequirmentOf<"user", User>;

export type Requirment = UserRequirement | LessonRequirement;

type Reward = {
  icon: string;
  xp: number;
};

export type Achievement = LeanDocument<{
  title: string;
  description: string;
  reward: Reward;
  requirements: Requirment[];
  achivmentLock?: string;
}>;

export type RequirmentProgress = { count: number; value: number };
export type AchievementProgress = Omit<Achievement, "requirements"> & {
  requirements: RequirmentProgress[];
  isCompleted: boolean;
};

export type AchievementsProccesorDependancies = {
  achievementsDal: AchievementsDal;
  lessonsDal: LessonsDal;
};
