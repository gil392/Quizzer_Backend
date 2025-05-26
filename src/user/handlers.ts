import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { isNil } from "ramda";
import { validateAuthenticatedRequest } from "../authentication/validators";
import { BadRequestError, NotFoundError } from "../services/server/exceptions";
import { UsersDal } from "./dal";
import { Settings } from "./settingsModel";
import {
  validateAnswerFriendRequestRequest,
  validateCreateFriendRequestRequest,
  validateEditUserRequest,
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
    const { searchTerm } = request.query;
    const users = await usersDal.searchUsers(searchTerm);

    response.json(users);
  });

export const createFriendRequest = (usersDal: UsersDal) =>
  validateCreateFriendRequestRequest(async (request, response) => {
    const { user } = request.body;
    const { id: friendToAdd } = request.user;
    const { matchedCount } = await usersDal.addFriendRequest(user, friendToAdd);

    if (matchedCount === 0) {
      throw new BadRequestError("cant ask friendship from non-existing user");
    }

    response.sendStatus(StatusCodes.CREATED);
  });

export const answerFriendRequest = (usersDal: UsersDal) =>
  validateAnswerFriendRequestRequest(async (request, response) => {
    const { accepted, friendRequester } = request.body;
    const { id: userId } = request.user;
    const user = await usersDal.findById(userId).lean();
    if (isNil(user) || !user.friendRequests?.includes(friendRequester)) {
      throw new BadRequestError(
        "cant accept or decline someone who isn't requested friendship"
      );
    }

    if (accepted) {
      await usersDal.acceptFriendship(userId, friendRequester);
    } else {
      await usersDal.declineFriendship(userId, friendRequester);
    }

    response.sendStatus(StatusCodes.OK);
  });

export const getUserFriends = (usersDal: UsersDal) =>
  validateAuthenticatedRequest(async (request, response) => {
    const { id: userId } = request.user;
    const users = await usersDal.getUserFriends(userId);

    response.json(users);
  });

export const getUserFriendsRequests = (usersDal: UsersDal) =>
  validateAuthenticatedRequest(async (request, response) => {
    const { id: userId } = request.user;
    const users = await usersDal.getUserFriendsRequests(userId);

    response.json(users);
  });

export const editUser = (usersDal: UsersDal) =>
  validateEditUserRequest(async (request, response) => {
    const { id: userId } = request.user;
    const { username, settings: partialSettings } = request.body;
    const settings = await getSettings(usersDal, userId, partialSettings);
    const updatedUser = await usersDal
      .updateById(userId, { username, settings })
      .lean();

    if (!updatedUser) {
      throw new NotFoundError("could not find user");
    }
    response.json(updatedUser);
  });

export const getMessages: RequestHandler = (_req, res) => {
  res.sendStatus(StatusCodes.NOT_IMPLEMENTED);
};

const getSettings = async (
  usersDal: UsersDal,
  userId: string,
  partialSettings: Partial<Settings> | undefined
): Promise<Partial<Settings> | undefined> => {
  if (!partialSettings) {
    return undefined;
  }

  const user = await usersDal.findPublicUserById(userId).lean();
  if (!user) {
    throw new NotFoundError("user not found");
  }
  const { settings } = user;

  return {
    feedbackType: partialSettings?.feedbackType ?? settings?.feedbackType,
    questionsOrder: partialSettings?.questionsOrder ?? settings?.questionsOrder,
    displayMode: partialSettings?.displayMode ?? settings?.displayMode,
    maxQuestionCount:
      partialSettings?.maxQuestionCount ?? settings?.maxQuestionCount,
    isManualCount: partialSettings?.isManualCount ?? settings?.isManualCount,
    solvingTimeMs: partialSettings?.solvingTimeMs ?? settings?.solvingTimeMs,
  };
};
