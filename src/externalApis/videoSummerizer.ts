import { OpenAiConfig } from "./openAiConfig";
import { Summarizer } from "./transcriptSummarizer/transcriptSummarizer";
import { fetchVideoTranscript } from "./youtube/getCaptions";

export class VideoSummeraizer {
    private summarizer: Summarizer;

    constructor(private readonly OpenAiConfig: OpenAiConfig) {
        this.summarizer = new Summarizer(OpenAiConfig)
    }

    summerizeVideo = async (videoId: string): Promise<string> => {
        const videoTranscript = await fetchVideoTranscript(videoId);
        return videoTranscript ? this.summarizer.summarizeTranscript(videoTranscript) : '';
    }
}
