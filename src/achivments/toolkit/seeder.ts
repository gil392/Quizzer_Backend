import { Types } from "mongoose";
import { AchievementsDal } from "../dal";

// Tier 0 Achievements (no dependencies)
const achievementsTier0 = [
  {
    _id: new Types.ObjectId(),
    title: "Friendly Beginner",
    description: "Add your first friend to unlock this achievement.",
    reward: {
      icon: "/images/achievements/friendly-beginner.png",
      xp: 50,
    },
    requirements: [
      {
        type: "user" as const,
        condition: {
          values: { friends: 1 },
          count: 1,
        },
      },
    ],
    sharedUsers: [] as string[],
  },
  {
    _id: new Types.ObjectId(),
    title: "Quiz Master",
    description: "Score 90% or higher on 5 quizzes.",
    reward: {
      icon: "/images/achievements/quiz-master.png",
      xp: 150,
    },
    requirements: [
      {
        type: "quizAttempt" as const,
        condition: {
          values: { score: 90 },
          count: 5,
        },
      },
    ],
    sharedUsers: [] as string[],
  },
  {
    _id: new Types.ObjectId(),
    title: "Lesson Explorer",
    description: "Share 5 lessons with other users.",
    reward: {
      icon: "/images/achievements/lesson-explorer.png",
      xp: 100,
    },
    requirements: [
      {
        type: "lesson" as const,
        condition: {
          values: { sharedUsers: 1 },
          count: 5,
        },
      },
    ],
    sharedUsers: [] as string[],
  },
  {
    _id: new Types.ObjectId(),
    title: "Daily Learner",
    description: "Create a lesson every day for 7 consecutive days.",
    reward: {
      icon: "/images/achievements/daily-learner.png",
      xp: 150,
    },
    requirements: [
      {
        type: "user" as const,
        condition: {
          values: { streak: 7 },
          count: 1,
        },
      },
    ],
    sharedUsers: [] as string[],
  },
];

// Tier 1 Achievements (depend on Tier 0)
const achievementsTier1 = [
  {
    _id: new Types.ObjectId(),
    title: "Social Butterfly",
    description: "Add 10 friends to unlock this achievement.",
    reward: {
      icon: "/images/achievements/social-butterfly.png",
      xp: 100,
    },
    requirements: [
      {
        type: "user" as const,
        condition: {
          values: { friends: 10 },
          count: 1,
        },
      },
    ],
    sharedUsers: [] as string[],
    achivmentLock: achievementsTier0[0]._id, // Friendly Beginner
  },
  {
    _id: new Types.ObjectId(),
    title: "Quiz Champion",
    description: "Score 100% on 3 quizzes in a row.",
    reward: {
      icon: "/images/achievements/quiz-champion.png",
      xp: 200,
    },
    requirements: [
      {
        type: "quizAttempt" as const,
        condition: {
          values: { score: 100 },
          count: 3,
        },
      },
    ],
    sharedUsers: [] as string[],
    achivmentLock: achievementsTier0[1]._id, // Quiz Master
  },
  {
    _id: new Types.ObjectId(),
    title: "Knowledge Seeker",
    description: "Share 10 lessons with other users.",
    reward: {
      icon: "/images/achievements/knowledge-seeker.png",
      xp: 200,
    },
    requirements: [
      {
        type: "lesson" as const,
        condition: {
          values: { sharedUsers: 1 },
          count: 10,
        },
      },
    ],
    sharedUsers: [] as string[],
    achivmentLock: achievementsTier0[2]._id, // Lesson Explorer
  },
  {
    _id: new Types.ObjectId(),
    title: "Consistency Champion",
    description: "Maintain a streak of lesson creation for 30 days.",
    reward: {
      icon: "/images/achievements/consistency-champion.png",
      xp: 300,
    },
    requirements: [
      {
        type: "user" as const,
        condition: {
          values: { streak: 30 },
          count: 1,
        },
      },
    ],
    sharedUsers: [] as string[],
    achivmentLock: achievementsTier0[3]._id, // Daily Learner
  },
];

const achievements = achievementsTier0.concat(achievementsTier1);

export const seedAchievements = async (achievementsDal: AchievementsDal) => {
  for (const achievement of achievements) {
    const existing = await achievementsDal.find({ title: achievement.title });
    if (!existing || (Array.isArray(existing) && existing.length === 0)) {
      await achievementsDal.create(achievement);
      console.log(`Achievement "${achievement.title}" created.`);
    } else {
      console.log(`Achievement "${achievement.title}" already exists.`);
    }
  }
};
