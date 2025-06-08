import { achievementModel } from "../model";
import { ObjectId } from "mongodb";

const achievements = [
  {
    _id: new ObjectId(),
    title: "Friendly Beginner",
    description: "Add your first friend to unlock this achievement.",
    reward: {
      icon: "/images/achievements/friendly-beginner.png",
      xp: 50,
    },
    requirements: [
      {
        type: "user",
        condition: {
          values: { friends: 1 },
          count: 1,
        },
      },
    ],
  },
  {
    _id: new ObjectId(),
    title: "Social Butterfly",
    description: "Add 10 friends to unlock this achievement.",
    reward: {
      icon: "/images/achievements/social-butterfly.png",
      xp: 100,
    },
    requirements: [
      {
        type: "user",
        condition: {
          values: { friends: 10 },
          count: 1,
        },
      },
    ],
    achivmentLock: null as ObjectId | null, // Will depend on "Friendly Beginner"
  },
  {
    _id: new ObjectId(),
    title: "Quiz Master",
    description: "Score 90% or higher on 5 quizzes.",
    reward: {
      icon: "/images/achievements/quiz-master.png",
      xp: 150,
    },
    requirements: [
      {
        type: "quizAttempt",
        condition: {
          values: { score: 90 },
          count: 5,
        },
      },
    ],
  },
  {
    _id: new ObjectId(),
    title: "Quiz Champion",
    description: "Score 100% on 3 quizzes in a row.",
    reward: {
      icon: "/images/achievements/quiz-champion.png",
      xp: 200,
    },
    requirements: [
      {
        type: "quizAttempt",
        condition: {
          values: { score: 100 },
          count: 3,
        },
      },
    ],
    achivmentLock: null as ObjectId | null, // Will depend on "Quiz Master"
  },
  {
    _id: new ObjectId(),
    title: "Lesson Explorer",
    description: "Share 5 lessons with other users.",
    reward: {
      icon: "/images/achievements/lesson-explorer.png",
      xp: 100,
    },
    requirements: [
      {
        type: "lesson",
        condition: {
          values: { sharedUsers: 1 }, // At least 1 shared user per lesson
          count: 5, // 5 lessons must meet this condition
        },
      },
    ],
  },
  {
    _id: new ObjectId(),
    title: "Knowledge Seeker",
    description: "Share 10 lessons with other users.",
    reward: {
      icon: "/images/achievements/knowledge-seeker.png",
      xp: 200,
    },
    requirements: [
      {
        type: "lesson",
        condition: {
          values: { sharedUsers: 1 }, // At least 1 shared user per lesson
          count: 10, // 10 lessons must meet this condition
        },
      },
    ],
    achivmentLock: null as ObjectId | null, // Will depend on "Lesson Explorer"
  },
  {
    _id: new ObjectId(),
    title: "Daily Learner",
    description: "Create a lesson every day for 7 consecutive days.",
    reward: {
      icon: "/images/achievements/daily-learner.png",
      xp: 150,
    },
    requirements: [
      {
        type: "user",
        condition: {
          values: { streak: 7 }, // 7-day streak of lesson creation
          count: 1,
        },
      },
    ],
  },
  {
    _id: new ObjectId(),
    title: "Consistency Champion",
    description: "Maintain a streak of lesson creation for 30 days.",
    reward: {
      icon: "/images/achievements/consistency-champion.png",
      xp: 300,
    },
    requirements: [
      {
        type: "user",
        condition: {
          values: { streak: 30 }, // 30-day streak of lesson creation
          count: 1,
        },
      },
    ],
    achivmentLock: null as ObjectId | null, // Will depend on "Daily Learner"
  },
];

// Add dependencies using `achivmentLock`
achievements.forEach((achievement) => {
  if (achievement.title === "Social Butterfly") {
    achievement.achivmentLock = achievements.find(
      (a) => a.title === "Friendly Beginner"
    )?._id;
  }
  if (achievement.title === "Quiz Champion") {
    achievement.achivmentLock = achievements.find(
      (a) => a.title === "Quiz Master"
    )?._id;
  }
  if (achievement.title === "Knowledge Seeker") {
    achievement.achivmentLock = achievements.find(
      (a) => a.title === "Lesson Explorer"
    )?._id;
  }
  if (achievement.title === "Consistency Champion") {
    achievement.achivmentLock = achievements.find(
      (a) => a.title === "Daily Learner"
    )?._id;
  }
});

export const seedAchievements = async () => {
  for (const achievement of achievements) {
    const existingAchievement = await achievementModel.findOne({
      title: achievement.title,
    });

    if (!existingAchievement) {
      await achievementModel.create(achievement);
      console.log(`Achievement "${achievement.title}" created.`);
    } else {
      console.log(`Achievement "${achievement.title}" already exists.`);
    }
  }
};