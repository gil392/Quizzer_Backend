import OpenAI from "openai";
import { Lesson } from "../lesson/model";
import { Question } from "../quiz/types";
import { SummarizerConfig } from "./transcriptSummarizer/config";

export class QuestionsGenerator {
  private openAI: OpenAI;
  constructor(private readonly config: SummarizerConfig) {
    this.openAI = new OpenAI({ apiKey: config.apiKey });
  }

  generateQuestionsFromLessonSummary = async (
    summary: Lesson["summary"],
    questionsCount?: number
  ): Promise<Question[]> => {
    try {
      const optionsCount = 4;
      const questions = await this.generateQuestions(
        summary,
        optionsCount,
        questionsCount
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
   * @param questionsCount The number of questions to generate (default is 2).
   * @returns A Promise resolving to an array of Question objects.
   */
  generateQuestions = async (
    summary: string,
    optionsCount: number = 4,
    questionsCount: number = 2
  ): Promise<Question[]> => {
    try {
      const response = await this.openAI.chat.completions.create({
        model: "gpt-3.5-turbo",
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
      ["string", "string", ...],
    "correctAnswer": "string"
  }
  
  Each question must have exactly ${optionsCount} options (1 correct answer and ${
              optionsCount - 1
            } incorrect answers). Use the summary below to create ${questionsCount} questions:
  
  ${summary}
  `,
          },
        ],
      });

      const generatedText = response.choices[0].message?.content;

      if (!generatedText) {
        throw new Error("Error in creating quiz from summary.");
      }
      const questions: Question[] = JSON.parse(generatedText);
      return questions;
    } catch (error) {
      console.error("Error generating questions:", error);
      throw error;
    }
  };
}
