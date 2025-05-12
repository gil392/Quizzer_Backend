import { BasicDal } from "../services/database/base.dal";
import {
  EXCLUDE_USER_PRIVATE_PROPERTIES_PROJECTION,
  SEARCH_USER_SELECT,
} from "./consts";
import { User } from "./model";

export class UsersDal extends BasicDal<User> {
  findByUsername = (username: string) => this.model.findOne({ username });

  findPublicUserById = (id: string) =>
    this.findById(id, EXCLUDE_USER_PRIVATE_PROPERTIES_PROJECTION);

  searchUsers = (searchTerm: string, limit: number = 10) => {
    const regex = new RegExp(searchTerm, "i");

    return this.model
      .find({
        $or: [{ username: { $regex: regex } }, { email: { $regex: regex } }],
      })
      .select(SEARCH_USER_SELECT)
      .limit(limit);
  };

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
    this.model.updateOne(
      { _id: userId },
      {
        $pull: { friendRequests: acceptedFriend },
        $addToSet: { friends: acceptedFriend },
      }
    );
}
