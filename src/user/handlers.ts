import { validateAuthenticatedRequest } from "../authentication/validators";
import { NotFoundError } from "../services/server/exceptions";
import { UsersDal } from "./dal";
import { validateEditUserRequest } from "./validators";

export const getLoggedUser = (usersDal: UsersDal) =>
  validateAuthenticatedRequest(async (request, response) => {
    const { id: userId } = request.user;
    const user = await usersDal.findPublicUserById(userId).lean();
    if (!user) {
      throw new NotFoundError("user not found");
    }
    response.json(user);
  });

export const editUser = (usersDal: UsersDal) =>
  validateEditUserRequest(async (request, response) => {
    const { id: userId } = request.user;
    const { username, settings } = request.body;
    const updatedUser = await usersDal
      .updateById(userId, { username, settings })
      .lean();

    if (!updatedUser) {
      throw new NotFoundError("could not find user");
    }
    response.json(updatedUser);
  });
