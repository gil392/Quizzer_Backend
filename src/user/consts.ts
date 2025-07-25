import { ProjectionType } from "mongoose";
import { UserWithAuthentication } from "./model";

export const EXCLUDE_USER_AUTH_PROPERTIES_PROJECTION = {
  hashedPassword: 0,
  refreshToken: 0,
  googleId: 0,
} satisfies ProjectionType<UserWithAuthentication>;

export const SEARCH_USER_SELECT_KEYS = [
  "username",
  "email",
  "_id",
] satisfies (keyof UserWithAuthentication)[];
export const SEARCH_USER_SELECT = SEARCH_USER_SELECT_KEYS.join(" ");
