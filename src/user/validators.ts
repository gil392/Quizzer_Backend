import { z } from "zod";
import { authenticatedRequestZodSchema } from "../authentication/validators";
import { validateHandlerRequest } from "../services/server/validators";
import { defaultSettingsZodSchema } from "./defaultSettingsModel";

const editUserRequestZodSchema = authenticatedRequestZodSchema.and(
  z.object({
    body: z.object({
      username: z.string().optional(),
      defaultSettings: defaultSettingsZodSchema.optional(),
    }),
  })
);

export type EditUserRequest = z.infer<typeof editUserRequestZodSchema>;
export const validateEditUserRequest = validateHandlerRequest(
  editUserRequestZodSchema
);
