import { RequestHandler, Router } from "express";
import { UsersDal } from "../user/dal";
import { AchivementsProccesor } from "./toolkit/proccesor";
import * as handlers from "./handlers";
import { AchievementsDal } from "./dal";

/**
 * @swagger
 * tags:
 *   name: Achievement
 *   description: API for /achievement
 */

export type AchievementRouterDependencies = {
  usersDal: UsersDal;
  achievementsDal: AchievementsDal;
  achievementsProccesor: AchivementsProccesor;
};

const createRouterController = ({
  usersDal,
  achievementsDal,
  achievementsProccesor,
}: AchievementRouterDependencies): Record<
  keyof typeof handlers,
  RequestHandler
> => ({
  getAchievementProgress: handlers.getAchievementProgress(
    usersDal,
    achievementsDal,
    achievementsProccesor
  ),
  getAchievementImage: handlers.getAchievementImage(achievementsDal),
});

export const createAchievementsRouter = (
  authMiddleware: RequestHandler,
  dependencies: AchievementRouterDependencies
) => {
  const controller = createRouterController(dependencies);
  const router = Router();

  /**
   * @swagger
   * /achievement/progress:
   *   get:
   *     summary: Get achievements progress
   *     description: Returns achievements progress for the logged-in user or a friend if `friendId` is provided.
   *     tags:
   *       - Achievement
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: friendId
   *         required: false
   *         schema:
   *           type: string
   *           description: ID of the friend whose progress is requested
   *     responses:
   *       200:
   *         description: Achievements progress
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AchievementProgress'
   *       401:
   *         description: User is unauthorized
   *       404:
   *         description: User not found
   *       500:
   *         description: Server error
   */
  router.get("/progress", authMiddleware, controller.getAchievementProgress);

  /**
   * @swagger
   * /achievement/image/{id}:
   *   get:
   *     summary: Get the image of an achievement
   *     description: Returns the image associated with an achievement
   *     tags:
   *       - Achievement
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           description: The ID of the achievement
   *     responses:
   *       200:
   *         description: The image of the achievement
   *         content:
   *           image/png:
   *             schema:
   *               type: string
   *               format: binary
   *       404:
   *         description: Achievement not found
   *       500:
   *         description: Server error
   */
    router.get("/image/:id", controller.getAchievementImage);

  return router;
};
