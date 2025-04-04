import { openai } from "../../openAiKey";

interface Question {
  question: string;
  options: { text: string; number: number }[];
  correctAnswer: number;
}

/**
 * Generates multiple-choice questions based on a summary.
 * @param summary The text summary to generate questions from.
 * @param optionsCount The number of options per question (default is 4).
 * @returns A Promise resolving to an array of Question objects.
 */
async function generateQuestions(
  summary: string,
  optionsCount: number = 4
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
  "options": [
    { "text": "string", "number": number },
    ...
  ],
  "correctAnswer": number
}

Each question must have exactly ${optionsCount} options. Use the summary below to create 2-3 questions:

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

// Example usage
export default async function generateQuizFromSummary() {
  const summary = `
    TypeScript is a programming language developed by Microsoft. It builds on JavaScript by adding static type definitions.
    This allows developers to catch errors earlier in the development process, and provides tools for better code navigation and refactoring.
  `;

  try {
    const optionsCount = 3;
    const questions = await generateQuestions(summary, optionsCount);
    console.log(JSON.stringify(questions, null, 2));
  } catch (error) {
    console.error("Failed to generate questions:", error);
  }
}
