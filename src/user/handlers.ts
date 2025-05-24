import { validateAuthenticatedRequest } from "../authentication/validators";
import { NotFoundError } from "../services/server/exceptions";
import { UsersDal } from "./dal";
import { Settings } from "./settingsModel";
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
    const { settings: partialSettings, ...userDetails } = request.body;
    const settings = await getSettings(usersDal, userId, partialSettings);
    const updatedUser = await usersDal
      .updateById(userId, { ...userDetails, settings })
      .lean();

    if (!updatedUser) {
      throw new NotFoundError("could not find user");
    }
    response.json(updatedUser);
  });

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
