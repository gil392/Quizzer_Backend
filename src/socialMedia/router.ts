import { Router } from "express";

/**
 * @swagger
 * tags:
 *   name: SocialMedia
 *   description: API for sharing content on social media
 */

export const createShareRouter = (): Router => {
  const router = Router();

  /**
   * @swagger
   * /share/invite:
   *   get:
   *     summary: Share an invitation link
   *     tags: [SocialMedia]
   *     description: Generates a page with Open Graph metadata for sharing an invitation link on social media.
   *     responses:
   *       200:
   *         description: HTML page with Open Graph metadata for "Invite a Friend"
   *         content:
   *           text/html:
   *             schema:
   *               type: string
   *               example: "<!DOCTYPE html>..."
   */
  router.get("/invite", (req, res) => {
    res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta property="og:title" content="Invite a Friend to Quizzer!" />
                <meta property="og:description" content="Join the fun and challenge your friends with Quizzer!" />
                <meta property="og:image" content="https://gil392.github.io/Quizzer_Frontend/docs/sonic.jpg" />
                <meta property="og:url" content="https://Quizzer_Backend.loca.lt/share/invite" />
                <meta property="og:type" content="website" />
                <title>Invite a Friend</title>
            </head>
            <body>
                <h1>Invite a Friend</h1>
                <p>Share this link with your friends to invite them to Quizzer!</p>
            </body>
            </html>
        `);
  });

  /**
   * @swagger
   * /share/success:
   *   get:
   *     summary: Share a success message
   *     tags: [SocialMedia]
   *     description: Generates a page with Open Graph metadata for sharing a success message on social media.
   *     responses:
   *       200:
   *         description: HTML page with Open Graph metadata for "Mission Succeeded"
   *         content:
   *           text/html:
   *             schema:
   *               type: string
   *               example: "<!DOCTYPE html>..."
   */
  router.get("/success", (req, res) => {
    res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta property="og:title" content="Mission Succeeded!" />
                <meta property="og:description" content="Congratulations on completing your mission in Quizzer!" />
                <meta property="og:image" content="https://gil392.github.io/Quizzer_Frontend/docs/sonic.jpg" />
                <meta property="og:url" content="${req.protocol}://${req.get(
      "host"
    )}/share/success" />
                <meta property="og:type" content="website" />
                <title>Mission Succeeded</title>
            </head>
            <body>
                <h1>Mission Succeeded</h1>
                <p>Share your success with your friends!</p>
            </body>
            </html>
        `);
  });

  return router;
};
