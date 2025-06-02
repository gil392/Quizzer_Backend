import { LessonsDal } from "../../../lesson/dal";
import { createDatabaseConfig } from "../../../services/database/config";
import { Database } from "../../../services/database/database";
import { createTestEnv } from "../../../utils/tests/utils";
import { AchievementsDal } from "../../dal";
import { AchivementsProccesor } from "../achivmentsProccesor";
import {
    loggedUser,
} from "../../__tests__/mocks";
import {
  userCompletedAchievement,
  userCompletedMultipleRequirementsAchievement,
  userNotCompletedArrayPropertyAchievement,
  userNotCompletedMultipleRequirementsAchievement,
  userPartialCompletedMultipleRequirementsAchievement,
} from '../../__tests__/user.achievements.mock'
import {
  lessonCompletedAchievement,
lessonCompletedCountGreaterThanOneAchievement,
lessonNotCompletedAchievement,
loggedUserLessons,
} from '../../__tests__/lesson.achievements.mock'

describe("achivmentsProccesor", () => {
  const config = createTestEnv();

  const database = new Database(createDatabaseConfig(config));
  const { achievementModel, lessonModel, userModel } = database.getModels();
  const achievementsDal = new AchievementsDal(achievementModel);
  const lessonsDal = new LessonsDal(lessonModel);

  const achivmentsProccesor = new AchivementsProccesor({
    achievementsDal,
    lessonsDal,
  });

  beforeAll(async () => {
    await database.start();
  });
  afterAll(async () => {
    await database.stop();
  });

  beforeEach(async () => {
    await userModel.create(loggedUser);
  });
  afterEach(async () => {
    await achievementModel.deleteMany();
    await userModel.deleteMany();
  });

  describe("check user requirement", () => {
    test("requirement of array property should return correct achievment progress", async () => {
      const progress = await achivmentsProccesor.getAchievmentProgress(
        loggedUser,
        userNotCompletedArrayPropertyAchievement
      );

      const { requirements, isCompleted } = progress;
      expect(requirements.length).toBe(1);
      expect(isCompleted).toBe(false);
      expect(requirements[0]).toStrictEqual({ value: 2, count: 10 });
    });

    test("requirement of number property should return correct achievment progress", async () => {
      const progress = await achivmentsProccesor.getAchievmentProgress(
        loggedUser,
        userCompletedAchievement
      );

      const { requirements, isCompleted } = progress;
      expect(requirements.length).toBe(1);
      expect(isCompleted).toBe(true);
      expect(requirements[0]).toStrictEqual({ value: 200, count: 100 });
    });

    test("user with all requirements should return completed achievment", async () => {
      const progress = await achivmentsProccesor.getAchievmentProgress(
        loggedUser,
        userCompletedMultipleRequirementsAchievement
      );

      const { requirements, isCompleted } = progress;
      expect(requirements.length).toBe(2);
      expect(isCompleted).toBe(true);
      expect(requirements).toStrictEqual([
        { value: 2, count: 1 },
        { value: 200, count: 100 },
      ]);
    });

    test("user with partial requirements should return not completed achievment with correct progress", async () => {
      const progress = await achivmentsProccesor.getAchievmentProgress(
        loggedUser,
        userPartialCompletedMultipleRequirementsAchievement
      );

      const { requirements, isCompleted } = progress;
      expect(requirements.length).toBe(2);
      expect(isCompleted).toBe(false);
      expect(requirements).toStrictEqual([
        { value: 2, count: 10 },
        { value: 200, count: 100 },
      ]);
    });

    test("user without any completed requirement should return not completed achievment with no progress", async () => {
      const progress = await achivmentsProccesor.getAchievmentProgress(
        loggedUser,
        userNotCompletedMultipleRequirementsAchievement
      );

      const { requirements, isCompleted } = progress;
      expect(requirements.length).toBe(2);
      expect(isCompleted).toBe(false);
      expect(requirements).toStrictEqual([
        { value: 2, count: 10 },
        { value: 200, count: 500 },
      ]);
    });
  });

  describe("check lesson requirement", () => {
    beforeEach(async () => {
      await lessonModel.insertMany(loggedUserLessons);
    });
    afterEach(async () => {
      await lessonModel.deleteMany();
    });

    test("requirements completed should return completed achievment", async () => {
      const progress = await achivmentsProccesor.getAchievmentProgress(
        loggedUser,
        lessonCompletedAchievement
      );

      const { requirements, isCompleted } = progress;
      expect(requirements.length).toBe(1);
      expect(isCompleted).toBe(true);
      expect(requirements[0]).toStrictEqual({ value: 2, count: 1 });
    });

    test("requirement for multiple documents (count greater than 1) should return completed achievment", async () => {
      const progress = await achivmentsProccesor.getAchievmentProgress(
        loggedUser,
        lessonCompletedCountGreaterThanOneAchievement
      );

      const { requirements, isCompleted } = progress;
      expect(requirements.length).toBe(1);
      expect(isCompleted).toBe(true);
      expect(requirements[0]).toStrictEqual({ value: 2, count: 2 });
    });

    test("requirement not completed should return not completed achievment", async () => {
      const progress = await achivmentsProccesor.getAchievmentProgress(
        loggedUser,
        lessonNotCompletedAchievement
      );

      const { requirements, isCompleted } = progress;
      expect(requirements.length).toBe(1);
      expect(isCompleted).toBe(false);
      expect(requirements[0]).toStrictEqual({ value: 0, count: 1 });
    });
  });
});
