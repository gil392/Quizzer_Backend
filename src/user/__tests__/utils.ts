import { keys, omit, pick, pipe } from "ramda";
import { WithStringId } from "../../utils/tests/types";
import {
  EXCLUDE_USER_AUTH_PROPERTIES_PROJECTION,
  SEARCH_USER_SELECT_KEYS,
} from "../consts";
import { User, UserWithAuthentication } from "../model";

export const omitAuthFromUser = (
  user: WithStringId<UserWithAuthentication>
): WithStringId<User> =>
  omit(keys(EXCLUDE_USER_AUTH_PROPERTIES_PROJECTION), user);

export const castUserToSearchUserResult = (
  user: WithStringId<UserWithAuthentication>
): Pick<
  WithStringId<UserWithAuthentication>,
  (typeof SEARCH_USER_SELECT_KEYS)[number]
> => pick(SEARCH_USER_SELECT_KEYS, user);

export const castObjectToResponseBody = pipe(JSON.stringify, JSON.parse);
