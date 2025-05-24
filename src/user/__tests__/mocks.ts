import { Types } from "mongoose";
import { User } from "../model";

export const loggedUser: User & { _id: string } = {
  _id: new Types.ObjectId().toString(),
  email: "loggedUser@gmail.com",
  username: " logged-user",
  hashedPassword: "jfbgajdfgn",
  favoriteLessons: [],
  friendRequests: [],
  friends: [],
  streak: 0,
  xp: 0,
};

export const otherUser: User & { _id: string } = {
  _id: new Types.ObjectId().toString(),
  email: "otherUser@gmail.com",
  username: "other-user",
  hashedPassword: "hjkvfgghjgfg",
  favoriteLessons: [],
  friendRequests: [],
  friends: [],
  streak: 0,
  xp: 0,
};
