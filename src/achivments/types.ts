import { LessonsDal } from "../lesson/dal";
import { Lesson } from "../lesson/model";
import { QuizzesDal } from "../quiz/dal";
import { UsersDal } from "../user/dal";
import { PublicUser } from "../user/model";
import { AchivmentsDal } from "./dal";

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
export type UserRequirement = RequirmentOf<"user", PublicUser>;

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

export type AchievementsProccesorDependancies = {
  quizzesDal: QuizzesDal;
  usersDal: UsersDal;
  achievmentsDal: AchivmentsDal;
  lessonsDal: LessonsDal;
};
