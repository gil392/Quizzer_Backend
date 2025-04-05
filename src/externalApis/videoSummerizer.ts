import { SummarizerConfig } from "./transcriptSummarizer/config";
import { Summarizer } from "./transcriptSummarizer/transcriptSummarizer";
import { fetchVideoTranscript } from "./youtube/getCaptions";

export class VideoSummeraizer {
    private summarizer: Summarizer; 
    
    constructor(private readonly summarizerConfig: SummarizerConfig ) {
        this.summarizer = new Summarizer(summarizerConfig) 
    }

    summerizeVideo = async (videoId: string): Promise<string> => {
        const videoTranscript = await fetchVideoTranscript(videoId);
        return videoTranscript ? this.summarizer.summarizeTranscript(videoTranscript) : '';
    }
}
