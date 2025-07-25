import { Types } from "mongoose";
import { isEmpty } from "ramda";
import { BasicDal } from "../services/database/base.dal";
import {
  EXCLUDE_USER_AUTH_PROPERTIES_PROJECTION,
  SEARCH_USER_SELECT
} from "./consts";
import { User, UserWithAuthentication } from "./model";

export class UsersDal extends BasicDal<UserWithAuthentication> {
  findByUsername = (username: string) => this.model.findOne({ username });

  findByGoogleId = (googleId: string) => this.model.findOne({ googleId });

  async createFromGoogleProfile(profile: any) {
    const email = profile.emails?.[0]?.value || `${profile.id}@google`;
    const username = profile.displayName || email.split('@')[0];
  
    return this.model.create({
      googleId: profile.id,
      email,
      username,
      streak: 0,
      lastQuizDate: new Date(0),
      xp: 0,
      friendRequests: [],
      friends: [],
      favoriteLessons: [],
      settings: {},
      refreshToken: []
    });
  }

  findPublicUserById = (id: string) =>
    this.findById(id, EXCLUDE_USER_AUTH_PROPERTIES_PROJECTION);

  findUserWithoutAuthById = async (id: string): Promise<User | null> =>
    await this.findById(id, EXCLUDE_USER_AUTH_PROPERTIES_PROJECTION).lean();

  searchUsers = (searchTerm: string, limit: number = 10) => {
    const regex = new RegExp(searchTerm, "i");

    return this.model
      .find({
        $or: [{ username: { $regex: regex } }, { email: { $regex: regex } }],
      })
      .select(SEARCH_USER_SELECT)
      .limit(limit);
  };

  private getUsersFromUser = async (
    userId: string,
    property: "friends" | "friendRequests"
  ): Promise<User[]> => {
    const result = await this.model.aggregate([
      {
        $match: { _id: new Types.ObjectId(userId) },
      },
      {
        $addFields: {
          objectIds: {
            $map: {
              input: `$${property}`,
              as: "id",
              in: { $toObjectId: "$$id" },
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "objectIds",
          foreignField: "_id",
          as: "friendUsers",
        },
      },
      {
        $project: {
          friendUsers: EXCLUDE_USER_AUTH_PROPERTIES_PROJECTION,
        },
      },
    ]);

    return isEmpty(result) ? [] : result[0].friendUsers;
  };

  getUserFriends = (userId: string) => this.getUsersFromUser(userId, "friends");

  getUserFriendsRequests = (userId: string) =>
    this.getUsersFromUser(userId, "friendRequests");

  addFriendRequest = (userId: string, friendToAdd: string) =>
    this.model.updateOne(
      { _id: userId },
      { $addToSet: { friendRequests: friendToAdd } }
    );

  declineFriendship = (userId: string, declinedFriend: string) =>
    this.model.updateOne(
      { _id: userId },
      { $pull: { friendRequests: declinedFriend } }
    );

  acceptFriendship = (userId: string, acceptedFriend: string) =>
    this.model.bulkWrite([
      {
        updateOne: {
          filter: { _id: userId },
          update: {
            $pull: { friendRequests: acceptedFriend },
            $addToSet: { friends: acceptedFriend },
          },
        },
      },
      {
        updateOne: {
          filter: { _id: acceptedFriend },
          update: { $addToSet: { friends: userId } },
        },
      },
    ]);

  addCompletedAchievments = (userId: string, achievements: string[]) =>
    this.model.updateOne(
      { _id: userId },
      { $addToSet: { achievements: { $each: achievements } } }
    );

  removeFriend = (userId: string, friendId: string) =>
    this.model.bulkWrite([
      {
        updateOne: {
          filter: { _id: userId },
          update: { $pull: { friends: friendId } },
        },
      },
      {
        updateOne: {
          filter: { _id: friendId },
          update: { $pull: { friends: userId } },
        },
      },
    ]);
}
