
import { OpenAI } from "openai";
import { SummarizerConfig  } from "./config";

export class Summarizer {
    private openAI: OpenAI; 
    constructor(
        private readonly config: SummarizerConfig ,
    ) {
        this.openAI = new OpenAI({apiKey: config.apiKey});
    }

    async getSummarizeTranscript(transcript: string) : Promise<string | undefined>{
      try {
          const response = await this.openAI.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: "Summarize the following text using bullet points" },
              { role: "user", content: transcript },
            ],
            temperature: 0.7,
            max_tokens: 500
          });
      
          return response.choices[0]?.message?.content || "No response from AI.";
        } catch (error) {
          return undefined;
      }
  }
}


