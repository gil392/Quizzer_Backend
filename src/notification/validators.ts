import { z } from "zod";
import { validateHandlerRequest } from "../services/server/validators";
import { authenticatedRequestZodSchema } from "../authentication/validators";

const getNotificationsByUserIdRequestSchema = z
    .object({})
    .merge(authenticatedRequestZodSchema);

export const getNotificationsValidatorByUserId = validateHandlerRequest(getNotificationsByUserIdRequestSchema);

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

const shareAchievementRequestSchema = z
    .object({
        body: z.object({
            toUserIds: z.array(z.string()),
            relatedEntityId: z.string(),
        }),
    }).merge(authenticatedRequestZodSchema);
export const shareAchievementValidator = validateHandlerRequest(shareAchievementRequestSchema);

const shareLessonRequestSchema = z
    .object({
        body: z.object({
            toUserIds: z.array(z.string()),
            relatedEntityId: z.string(),
        }),
    }).merge(authenticatedRequestZodSchema);

export const shareLessonValidator = validateHandlerRequest(shareLessonRequestSchema);

const friendRequestRequestSchema = z
    .object({
        body: z.object({
            toUserId: z.string(),
        }),
    })
    .merge(authenticatedRequestZodSchema);

export const friendRequestValidator = validateHandlerRequest(friendRequestRequestSchema);