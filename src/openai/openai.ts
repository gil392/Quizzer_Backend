
import { OpenAI } from "openai";
import { ChatGeneratorConfig } from "./config";

export class ChatGenerator {
    private openAI: OpenAI; 
    constructor(
        private readonly config: ChatGeneratorConfig,
    ) {
        this.openAI = new OpenAI({apiKey: config.apiKey});
    }
}


