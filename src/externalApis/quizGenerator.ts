import OpenAI from "openai";
import { Lesson } from "../lesson/model";
import { Question, QuizSettings } from "../quiz/types";
import { OpenAiConfig } from "./openAiConfig";

export class QuestionsGenerator {
  private openAI: OpenAI;
  constructor(private readonly config: OpenAiConfig) {
    this.openAI = new OpenAI({ apiKey: config.apiKey });
  }

  generateQuestionsFromLessonSummary = async (
    summary: Lesson["summary"],
    quizSettings: QuizSettings
  ): Promise<Question[]> => {
    try {
      const optionsCount = 4;
      const questions = await this.generateQuestions(
        summary,
        optionsCount,
        quizSettings
      );
      return questions;
    } catch (error) {
      console.error("Error generating questions from lesson summary:", error);
      throw error;
    }
  };

  /**
   * Generates multiple-choice questions based on a summary.
   * @param summary The text summary to generate questions from.
   * @param optionsCount The number of options per question (default is 4).
   * @param quizSettings Quiz customization settings from the client.
   * @returns A Promise resolving to an array of Question objects.
   */
  generateQuestions = async (
    summary: string,
    optionsCount: number = 4,
    quizSettings: QuizSettings
  ): Promise<Question[]> => {
    try {
      const response = await this.openAI.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an assistant that generates multiple-choice questions based on provided content.",
          },
          {
            role: "user",
            content: `
  Generate multiple-choice questions in the following JSON format without markdowns. Each question should follow this structure and be inserted into an array:
  {
    "question": "string",
    "incorrectAnswers":
      ["string", "string", "string", ...],
    "correctAnswer": "string"
  }
  
  Each question must have exactly ${optionsCount} answers (1 correct answer and ${
              optionsCount - 1
            } incorrect answers), all the answers must be different.
  Use the summary below to create ${quizSettings.maxQuestionCount} questions.
  If the summary is too short to generate ${
    quizSettings.maxQuestionCount
  } questions, generate as many as possible while maintaining the structure.
  
  summary: ${summary}
  `,
          },
        ],
      });

      const generatedText = response.choices[0].message?.content;

      if (!generatedText) {
        throw new Error("Error in creating quiz from summary.");
      }
      const questions: Question[] = JSON.parse(generatedText);

      if (quizSettings.questionsOrder === "random") {
        return this.shuffleArray(questions);
      }

      return questions;
    } catch (error) {
      console.error("Error generating questions:", error);
      throw error;
    }
  };

  /**
   * Shuffles an array in place.
   * uses the Fisher-Yates Shuffle Algorithm to randomize the order of elements in the array
   * @param array The array to shuffle.
   * @returns The shuffled array.
   */
  private shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}
