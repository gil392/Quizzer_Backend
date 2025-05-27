import { RequestHandler, Router } from "express";
import { UsersDal } from "../user/dal";
import { AchivementsProccesor } from "./achivmentsProccesor/achivmentsProccesor";
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
   *     summary: get user achievements progress
   *     description: get user achievements progress
   *     tags:
   *       - Achievement
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: achievements with their progress
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AchievementProgress'
   *       401:
   *         description: User is unauthorized
   *       500:
   *         description: Server error
   */
  router.get("/progress", authMiddleware, controller.getAchievementProgress);

  return router;
};
