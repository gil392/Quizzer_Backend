import { Types } from "mongoose";
import { mergeDeepRight } from "ramda";
import { Achievement, Requirement } from "../types";

export const createAchievementMock = (
  requirements: Requirement[],
  achievement?: Partial<Achievement>
): Achievement =>
  mergeDeepRight(
    {
      _id: new Types.ObjectId(),
      description: "test achievement description",
      requirements,
      reward: {
        icon: "icon",
        xp: 500,
      },
      title: "test achievement",
    } satisfies Achievement,
    achievement ?? {}
  );
