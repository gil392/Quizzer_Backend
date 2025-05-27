import { BasicDal } from "../services/database/base.dal";
import { LeanDocument } from "../services/database/types";
import { EXCLUDE_USER_AUTHENTICATION_PROPERTIES_PROJECTION } from "./consts";
import { User, UserWithAuthentication } from "./model";

export class UsersDal extends BasicDal<UserWithAuthentication> {
  findByUsername = (username: string) => this.model.findOne({ username });

  findUserWithoutAuthById = async (
    id: string
  ): Promise<LeanDocument<User> | null> =>
    await this.findById(id, EXCLUDE_USER_AUTHENTICATION_PROPERTIES_PROJECTION).lean();

  addCompletedAchievments = (userId: string, achievements: string[]) =>
    this.model.updateOne(
      { _id: userId },
      { $addToSet: { achievements: { $each: achievements } } }
    );
}
