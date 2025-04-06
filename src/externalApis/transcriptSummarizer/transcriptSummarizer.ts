
import { OpenAI } from "openai";
import { SummarizerConfig  } from "./config";
import { SUMMARIZER_PROMPT } from "./constants";
import { InternalServerError } from "../../services/server/exceptions";

export class Summarizer {
    private openAI: OpenAI; 
    constructor(
        private readonly config: SummarizerConfig ,
    ) {
        this.openAI = new OpenAI({apiKey: config.apiKey});
    }

    async summarizeTranscript(transcript: string) : Promise<string>{
      try {
          const response = await this.openAI.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: SUMMARIZER_PROMPT },
              { role: "user", content: transcript },
            ],
            temperature: 0.7,
            max_tokens: 500
          });
          console.log('summary:')
          console.log(response.choices[0]?.message?.content);

          return response.choices[0]?.message?.content || "No response from AI.";
        } catch (error) {
          throw new InternalServerError('Failed summerizing video transcript', 
            error instanceof Error ? error : undefined)
      }
  }
}


