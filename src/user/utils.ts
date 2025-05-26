import { differenceInCalendarDays } from "date-fns";
import { NotFoundError } from "../services/server/exceptions";
import { UsersDal } from "./dal";

export const updateUserStreak = async (usersDal: UsersDal, userId: string) => {
  const user = await usersDal.findPublicUserById(userId).lean();
  if (!user) {
    throw new NotFoundError("user not found");
  }

  const lastQuizDayDiff = differenceInCalendarDays(
    new Date(),
    user.lastQuizDate
  );

  if (lastQuizDayDiff > 0) {
    const streak = lastQuizDayDiff === 1 ? user.streak + 1 : 0;
    await usersDal
      .updateById(userId, { streak, lastQuizDate: new Date() })
      .lean();
  }
};
