import { Router } from "express";
import { AchievementsDal } from "../achivments/dal";
import { AttemptDal } from "../attempt/dal";
import * as handlers from "./handlers";

/**
 * @swagger
 * tags:
 *   name: SocialMedia
 *   description: API for social media preview links
 */

export type SocialMediaRouterDependencies = {};

const createRouterController = ({}: SocialMediaRouterDependencies) => ({
  getSocialPreview: handlers.getSocialPreview(),
});

export const createSocialMediaRouter = (
  dependencies: SocialMediaRouterDependencies
): Router => {
  const router = Router();
  const controller = createRouterController(dependencies);

  /**
   * @swagger
   * /social/preview:
   *   get:
   *     summary: Generate social media preview link
   *     description: Creates a shareable link that displays preview text and image for social media platforms
   *     tags: [SocialMedia]
   *     parameters:
   *       - in: query
   *         name: text
   *         required: true
   *         schema:
   *           type: string
   *           minLength: 1
   *         description: The text content to display in the preview
   *         example: "Check out this amazing achievement!"
   *       - in: query
   *         name: imageType
   *         required: true
   *         schema:
   *           type: string
   *           enum: [achievement, attempt]
   *         description: Type of image to display
   *         example: "achievement"
   *       - in: query
   *         name: imageId
   *         required: true
   *         schema:
   *           type: string
   *           pattern: ^[a-fA-F0-9]{24}$
   *         description: ID of the achievement or attempt
   *         example: "507f1f77bcf86cd799439011"
   *       - in: query
   *         name: link
   *         required: true
   *         schema:
   *           type: string
   *           format: uri
   *         description: The destination URL when the preview is clicked
   *         example: "http://localhost:8080/achievement/123"
   *       - in: query
   *         name: title
   *         schema:
   *           type: string
   *         description: Optional title for the preview
   *         example: "Achievement Unlocked!"
   *     responses:
   *       200:
   *         description: HTML page with social media-compatible meta tags
   *         content:
   *           text/html:
   *             schema:
   *               type: string
   *       400:
   *         description: Missing or invalid required parameters
   */
  router.get("/preview", controller.getSocialPreview);

  return router;
};
