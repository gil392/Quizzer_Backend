import { Schema } from "mongoose";
import { z } from "zod";

export type DefaultSettings = {
  feedbackType: "onSubmit" | "onSelectAnswer";
  questionsOrder: "chronological" | "random";
  displayMode: "Light" | "Dark";
  maxQuestionCount: number;
  isManualCount: boolean;
  solvingTimeMs: number;
};

export const defaultSettingsZodSchema: z.ZodType<DefaultSettings> = z.object({
  feedbackType: z.enum(["onSubmit", "onSelectAnswer"]),
  questionsOrder: z.enum(["chronological", "random"]),
  displayMode: z.enum(["Light", "Dark"]),
  maxQuestionCount: z.number(),
  isManualCount: z.boolean(),
  solvingTimeMs: z.coerce.number(),
});

export const defaultSettingsSchema = new Schema<DefaultSettings>({
  feedbackType: {
    type: String,
    enum: ["onSubmit", "onSelectAnswer"],
  },
  questionsOrder: {
    type: String,
    enum: ["chronological", "random"],
  },
  displayMode: {
    type: String,
    enum: ["Light", "Dark"],
  },
  maxQuestionCount: {
    type: Number,
  },
  isManualCount: {
    type: Boolean,
  },
  solvingTimeMs: {
    type: Number,
  },
});
