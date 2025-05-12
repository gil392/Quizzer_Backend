import { StatusCodes } from "http-status-codes";
import { validateAuthenticatedRequest } from "../authentication/validators";
import { NotFoundError } from "../services/server/exceptions";
import { UsersDal } from "./dal";
import {
  validateAnswerFriendRequestRequest,
  validateCreateFriendRequestRequest,
  validateSearchUsersRequest,
} from "./validators";

export const getLoggedUser = (usersDal: UsersDal) =>
  validateAuthenticatedRequest(async (request, response) => {
    const { id: userId } = request.user;
    const user = await usersDal.findPublicUserById(userId).lean();
    if (!user) {
      throw new NotFoundError("user not found");
    }
    response.json(user);
  });

export const searchUsers = (usersDal: UsersDal) =>
  validateSearchUsersRequest(async (request, response) => {
    const { q: searchTerm } = request.query;
    const users = await usersDal.searchUsers(searchTerm);

    response.json(users);
  });
