import { Lesson } from "../lesson/model";
import { openai } from "../openAiKey";
import { Question } from "../quiz/types";

export class QuestionsGenerator {
  constructor() {}

  generateQuestionsFromLessonSummary = async (
    summary: Lesson["summary"],
    questionsCount?: number
  ): Promise<Question[]> => {
    try {
      console.log("Generating questions from lesson summary...");
      const optionsCount = 4;
      const questions = await generateQuestions(
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
}

/**
 * Generates multiple-choice questions based on a summary.
 * @param summary The text summary to generate questions from.
 * @param optionsCount The number of options per question (default is 4).
 * @param questionsCount The number of questions to generate (default is 2).
 * @returns A Promise resolving to an array of Question objects.
 */
async function generateQuestions(
  summary: string,
  optionsCount: number = 4,
  questionsCount: number = 2
): Promise<Question[]> {
  try {
    const response = await openai.chat.completions.create({
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
Generate multiple-choice questions in the following JSON format:
{
  "question": "string",
  "incorrectAnswers": [
    { "text": "string", "number": number },
    ...
  ],
  "correctAnswer": { "text": "string", "number": number }
}

Each question must have exactly ${optionsCount} options (1 correct answer and ${
            optionsCount - 1
          } incorrect answers). Use the summary below to create ${questionsCount} questions:

${summary}
        `,
        },
      ],
    });

    // Parse the JSON response directly
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
}
