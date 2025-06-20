import { z } from "zod";
import { authenticatedRequestZodSchema } from "../authentication/validators";
import { validateHandlerRequest } from "../services/server/validators";
import { settingsZodSchema } from "./settingsModel";

const searchUsersRequestZodSchema = z.object({
  query: z.object({
    searchTerm: z.string(),
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

const editUserRequestZodSchema = authenticatedRequestZodSchema.and(
  z.object({
    body: z.object({
      username: z.string().optional(),
      profileImage: z.string().optional(),
      settings: settingsZodSchema.partial().optional(),
    }),
  })
);

export type EditUserRequest = z.infer<typeof editUserRequestZodSchema>;
export const validateEditUserRequest = validateHandlerRequest(
  editUserRequestZodSchema
);

export const DeleteFriendSchema = authenticatedRequestZodSchema.and(
  z.object({
    params: z.object({
      userId: z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid user ID"),
    }),
  })
);
export const validateDeleteFriendRequest = validateHandlerRequest(
  DeleteFriendSchema
);

export const FetchFriendByIdSchema = authenticatedRequestZodSchema.and(
  z.object({
    params: z.object({
      userId: z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid user ID"), 
    }),
  })
);
export const validateFetchFriendRequest = validateHandlerRequest(
  FetchFriendByIdSchema
);