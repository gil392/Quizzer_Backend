import { keys, omit, pick } from "ramda";
import {
  EXCLUDE_USER_PRIVATE_PROPERTIES_PROJECTION,
  SEARCH_USER_SELECT_KEYS,
} from "../consts";
import { PublicUser, User } from "../model";

export const castUserToPublicUser = (user: User): PublicUser =>
  omit(keys(EXCLUDE_USER_PRIVATE_PROPERTIES_PROJECTION), user);

export const castUserToSearchUserResult = (
  user: User & { _id: string }
): Pick<User & { _id: string }, typeof SEARCH_USER_SELECT_KEYS[number]> =>
  pick(SEARCH_USER_SELECT_KEYS, user);
