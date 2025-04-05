import { SummarizerConfig } from "./transcriptSummarizer/config";
import { Summarizer } from "./transcriptSummarizer/transcriptSummarizer";
import { fetchVideoTranscript } from "./youtube/getCaptions";
import { extractVideoId } from "./youtube/utils";

export class VideoSummeraizer {
    private summarizer: Summarizer; 
    
    constructor(private readonly summarizerConfig: SummarizerConfig ) {
        this.summarizer = new Summarizer(summarizerConfig) 
    }

    summerizeVideo = async (videoUrl: string): Promise<string> => {
       const videoId = extractVideoId(videoUrl);
        const videoTranscript = await fetchVideoTranscript(videoId);
        console.log('video transcript');
        console.log(videoTranscript);
        const summary = videoTranscript ? this.summarizer.summarizeTranscript(videoTranscript) : '';
        console.log('summary');
        console.log(summary);
        return summary;
    }
}
