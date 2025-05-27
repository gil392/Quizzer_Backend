import { keys, omit, pick } from "ramda";
import { WithStringId } from "../../utils/tests/types";
import {
  EXCLUDE_USER_AUTH_PROPERTIES_PROJECTION,
  SEARCH_USER_SELECT_KEYS,
} from "../consts";
import { User, UserWithAuthentication } from "../model";

export const castUserToPublicUser = (
  user: WithStringId<UserWithAuthentication>
): WithStringId<User> =>
  omit(keys(EXCLUDE_USER_AUTH_PROPERTIES_PROJECTION), user);

export const castUserToSearchUserResult = (
  user: WithStringId<UserWithAuthentication>
): Pick<
  WithStringId<UserWithAuthentication>,
  (typeof SEARCH_USER_SELECT_KEYS)[number]
> => pick(SEARCH_USER_SELECT_KEYS, user);
