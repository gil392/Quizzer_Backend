import { z } from "zod";
import { validateHandlerRequest } from "../services/server/validators";
import { authenticatedRequestZodSchema } from "../authentication/validators";

const getNotificationsRequestSchema = z.object({}).merge(authenticatedRequestZodSchema);

export const getNotificationsValidator = validateHandlerRequest(getNotificationsRequestSchema);

const markAsReadRequestSchema = z
    .object({
        params: z.object({
            id: z.string(),
        }),
    })
    .merge(authenticatedRequestZodSchema);

export const markAsReadValidator = validateHandlerRequest(markAsReadRequestSchema);

const deleteNotificationRequestSchema = z
    .object({
        params: z.object({
            id: z.string(),
        }),
    })
    .merge(authenticatedRequestZodSchema);

export const deleteNotificationValidator = validateHandlerRequest(deleteNotificationRequestSchema);