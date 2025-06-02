import { StatusCodes } from "http-status-codes";
import { dissoc, prop, sortBy } from "ramda";
import request, { Test as RequestTest } from "supertest";
import { createAuthConfig } from "../../authentication/config";
import { injectUserToRequest } from "../../authentication/middlewares";
import { generateTokens } from "../../authentication/utils";
import { createBasicApp } from "../../services/server/server";
import { castObjectToResponseBody } from "../../user/__tests__/utils";
import { UsersDal } from "../../user/dal";
import { WithStringId } from "../../utils/tests/types";
import { AchivementsProccesor } from "../achivmentsProccesor/achivmentsProccesor";
import { createAchievementsRouter } from "../router";
import { Achievement, AchievementProgress } from "../types";
import { LessonsDal } from "./../../lesson/dal";
import { createDatabaseConfig } from "./../../services/database/config";
import { Database } from "./../../services/database/database";
import { createTestEnv } from "./../../utils/tests/utils";
import { AchievementsDal } from "./../dal";
import {
    lessonAchievementsMock,
    loggedUserExpectedLessonsAchievementsProgresses,
    loggedUserLessons,
} from "./lesson.achievements.mock";
import { loggedUser } from "./mocks";
import {
    loggedUserExpectedUserAchievementsProgresses,
    userAchievementsMock,
} from "./user.achievements.mock";

describe("achievements router", () => {
  const config = createTestEnv();
  const authConfig = createAuthConfig(config);

  const database = new Database(createDatabaseConfig(config));
  const { achievementModel, lessonModel, userModel } = database.getModels();
  const achievementsDal = new AchievementsDal(achievementModel);
  const lessonsDal = new LessonsDal(lessonModel);
  const usersDal = new UsersDal(userModel);
  const achievementsProccesor = new AchivementsProccesor({
    achievementsDal,
    lessonsDal,
  });

  const loggedUserExpectedAchievemetnsProgress: AchievementProgress[] = [
    ...loggedUserExpectedUserAchievementsProgresses,
    ...loggedUserExpectedLessonsAchievementsProgresses,
  ];
  const achievementsMock: Achievement[] = [
    ...userAchievementsMock,
    ...lessonAchievementsMock,
  ];

  const authMiddleware = injectUserToRequest(config.AUTH_TOKEN_SECRET);
  const { accessToken } = generateTokens(authConfig, loggedUser._id.toString());
  const authHeader = "JWT ".concat(accessToken);
  const setAuthHeaderToRequest = (request: RequestTest) =>
    request.set("authorization", authHeader);

  const app = createBasicApp();
  app.use(
    "/",
    createAchievementsRouter(authMiddleware, {
      achievementsDal,
      achievementsProccesor,
      usersDal,
    })
  );

  beforeAll(async () => {
    await database.start();
  });
  afterAll(async () => {
    await database.stop();
  });

  beforeEach(async () => {
    await userModel.create(loggedUser);
    await achievementModel.insertMany(achievementsMock);
    await lessonModel.insertMany(loggedUserLessons);
  });
  afterEach(async () => {
    await achievementModel.deleteMany();
    await lessonModel.deleteMany();
    await userModel.deleteMany();
  });

  describe("get user progress", () => {
    const requestUserProgress = () => request(app).get("/progress");

    test("unauthenticated user should return UNAUTHORIZED", async () => {
      const response = await requestUserProgress();
      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    });

    test(
      "user should get his achievments progress",
      async () => {
        const response = await setAuthHeaderToRequest(requestUserProgress());

        expect(response.body instanceof Array).toBeTruthy();
        const achievements = sortBy(
          prop("_id"),
          (response.body as WithStringId<Achievement>[]).map(dissoc("__v"))
        );
        const expected = sortBy(
          prop("_id"),
          castObjectToResponseBody(
            loggedUserExpectedAchievemetnsProgress
          ) as WithStringId<AchievementProgress>[]
        );

        expect(achievements).toStrictEqual(expected);
      },
      10 * 60_000
    );
  });
});
