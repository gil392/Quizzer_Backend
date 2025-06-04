import { Types } from "mongoose";
import { UserWithAuthentication } from "../../user/model";

export const loggedUser: UserWithAuthentication = {
  _id: new Types.ObjectId(),
  email: "loggedUser@gmail.com",
  hashedPassword: "123456",
  lastQuizDate: new Date(),
  streak: 0,
  xp: 200,
  username: "logged-user",
  friends: ["friendOneId", "friendTwoId"],
};
