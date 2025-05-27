import { LessonsDal } from "../lesson/dal";
import { Lesson } from "../lesson/model";
import { QuizzesDal } from "../quiz/dal";
import { UsersDal } from "../user/dal";
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

type IconReward = {
  type: "icon";
  icon: string;
};

type XpReward = {
  type: "xp";
  xp: number;
};

type Reward = IconReward | XpReward;

export type Achievement = {
  description: string;
  rewards: Reward[];
  requirements: Requirment[];
  achivmentLock?: string;
};

export type RequirmentProgress = { count: number; progress: number };
export type AchievementProgress = Omit<Achievement, "requirements"> & {
  requirements: RequirmentProgress[];
};

export type AchievementsProccesorDependancies = {
  quizzesDal: QuizzesDal;
  usersDal: UsersDal;
  achievmentsDal: AchievementsDal;
  lessonsDal: LessonsDal;
};
