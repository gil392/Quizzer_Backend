import { z } from "zod";
import { authenticatedRequestZodSchema } from "../authentication/validators";
import { validateHandlerRequest } from "../services/server/validators";

const searchUsersRequestZodSchema = z.object({
  query: z.object({
    q: z.string(),
  }),
});
export const validateSearchUsersRequest = validateHandlerRequest(
  searchUsersRequestZodSchema
);

const createFriendRequestRequestZodSchema = authenticatedRequestZodSchema.and(
  z.object({
    body: z.object({
      user: z.string(),
    }),
  })
);
export const validateCreateFriendRequestRequest = validateHandlerRequest(
  createFriendRequestRequestZodSchema
);

const answerFriendRequestRequestZodSchema = authenticatedRequestZodSchema.and(
  z.object({
    body: z.object({
      friendRequester: z.string(),
      accepted: z.coerce.boolean(),
    }),
  })
);
export const validateAnswerFriendRequestRequest = validateHandlerRequest(
  answerFriendRequestRequestZodSchema
);
