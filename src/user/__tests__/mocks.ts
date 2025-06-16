import { Types } from "mongoose";
import { WithStringId } from "../../utils/tests/types";
import { UserWithAuthentication } from "../model";

export const loggedUser: WithStringId<UserWithAuthentication> = {
  _id: new Types.ObjectId().toString(),
  email: "loggedUser@gmail.com",
  username: " logged-user",
  hashedPassword: "jfbgajdfgn",
  favoriteLessons: [],
  friendRequests: [],
  friends: [],
  lastQuizDate: new Date(),
  streak: 0,
  xp: 0,
};

export const otherUser: WithStringId<UserWithAuthentication> = {
  _id: new Types.ObjectId().toString(),
  email: "otherUser@gmail.com",
  username: "other-user",
  hashedPassword: "hjkvfgghjgfg",
  favoriteLessons: [],
  friendRequests: [],
  friends: [],
  lastQuizDate: new Date(),
  streak: 0,
  xp: 0,
};
