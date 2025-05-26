import { BasicDal } from "../services/database/base.dal";
import { LeanDocument } from "../services/database/types";
import { EXCLUDE_USER_PRIVATE_PROPERTIES_PROJECTION } from "./consts";
import { PublicUser, User } from "./model";

export class UsersDal extends BasicDal<User> {
  findByUsername = (username: string) => this.model.findOne({ username });

  findPublicUserById = async (
    id: string
  ): Promise<LeanDocument<PublicUser> | null> =>
    await this.findById(id, EXCLUDE_USER_PRIVATE_PROPERTIES_PROJECTION).lean();
}
