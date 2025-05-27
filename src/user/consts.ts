import { ProjectionType } from "mongoose";
import { UserWithAuthentication } from "./model";

export const EXCLUDE_USER_AUTH_PROPERTIES_PROJECTION: ProjectionType<UserWithAuthentication> =
  {
    hashedPassword: 0,
    refreshToken: 0,
  };
