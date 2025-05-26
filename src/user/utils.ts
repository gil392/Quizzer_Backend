import { NotFoundError } from "../services/server/exceptions";
import { UsersDal } from "./dal";

export const updateUserStreak = async (usersDal: UsersDal, userId: string) => {
  const user = await usersDal.findPublicUserById(userId).lean();
  if (!user) {
    throw new NotFoundError("user not found");
  }
};
