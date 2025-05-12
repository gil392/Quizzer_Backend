import { ProjectionType } from "mongoose";
import { User } from "./model";

export const EXCLUDE_USER_PRIVATE_PROPERTIES_PROJECTION: ProjectionType<User> =
  {
    hashedPassword: 0,
    refreshToken: 0,
  };

export const USER_FRIENDS_PROJECTION: ProjectionType<User> = {
  email: 1,
  username: 1,
  favoriteLessons: 1,
  streak: 1,
};

export const SEARCH_USER_SELECT = "username email picture -_id";
