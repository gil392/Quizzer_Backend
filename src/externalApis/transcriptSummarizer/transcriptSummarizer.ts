
import { OpenAI } from "openai";
import { SummarizerConfig  } from "./config";
import { CHUNCK_SIZE, FINAL_SUMMARY_SYSTEM_PROMPT, OVERLAP } from "./constants";
import { InternalServerError } from "../../services/server/exceptions";
import { getSystemChunckSummaryPrompt, splitTranscirptIntoChunks } from "./utils";

export class Summarizer {
    private openAI: OpenAI;

    constructor(
        private readonly config: SummarizerConfig ,
    ) {
        this.openAI = new OpenAI({apiKey: config.apiKey});
        
    }

    async summarizeTranscript(transcript: string) : Promise<string>{
      const chuncks: string[] = splitTranscirptIntoChunks(transcript, CHUNCK_SIZE, OVERLAP);
      const summaries: string[] = await Promise.all(chuncks
        .map((chunck, index) => this.summarizeChunk(chunck, index)));      
      const finalSummary: string = await this.summarizeAllSummaries(summaries);       
      return finalSummary;
  }


  private async summarizeChunk(chunck: string, chunckIndex:number) : Promise<string>{    
    const systemPrompt: string = getSystemChunckSummaryPrompt(chunckIndex);
    return this.createAPIRequest(systemPrompt, chunck);
  }

  private async summarizeAllSummaries(summaries: string[]) : Promise<string>{
    const systemPrompt:string = FINAL_SUMMARY_SYSTEM_PROMPT;
    const combinedSummary = summaries.join('\n\n=== Next Section ===\n\n');
    return this.createAPIRequest(systemPrompt, combinedSummary);
  }


  private async createAPIRequest(systemPrompt: string, userPrompt: string) : Promise<string>{
    try {
          const response = await this.openAI.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.7,
            max_tokens: 500
          });
   
          return response.choices[0]?.message?.content || "No response from AI.";
        } catch (error) {
          throw new InternalServerError('Failed summerizing video transcript', 
            error instanceof Error ? error : undefined)
      }
  }
}
