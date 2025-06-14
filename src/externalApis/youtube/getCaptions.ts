import { google } from 'googleapis';
import { authenticate } from './authentication';
import { YoutubeTranscript, TranscriptConfig } from './youtubeTranscript';

interface CaptionDetails {
    language: string;
    name: string;
    isAutoGenerated: boolean;
    trackId: string;
}

const MAX_TRANSCRIPT_FETCH_RETRIES = 10;

export const listCaptions = async (videoId: string): Promise<CaptionDetails[] | null> => {
    const oauth2Client = await authenticate();
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    try {
        const response = await youtube.captions.list({
            part: ['snippet'],
            videoId: videoId,
        });

        if (response.data.items?.length === 0) {
            console.log('No captions available.');
            return null;
        }

        const captions: CaptionDetails[] = (response.data.items ?? [])
            .filter((caption) => caption.snippet)
            .map((caption) => ({
                language: caption.snippet?.language || '',
                name: caption.snippet?.name || '',
                isAutoGenerated: false,
                trackId: caption.id || '',
            }));

        return captions;
    } catch (error) {
        console.error('Error fetching captions:', error);
        return null;
    }
};

export const fetchVideoTranscript = async (videoId: string): Promise<string | null> => {
    const captions = await listCaptions(videoId);
    const englishCaption = captions?.find((caption) => caption.language === 'en');
    if (!englishCaption) {
        console.warn('No English captions available for this video.');
        return null;
    }

    const transcriptConfig: TranscriptConfig = { lang: englishCaption.language };
    let transcriptList: { text: string }[] = [];

    for (let attempt = 1; attempt <= MAX_TRANSCRIPT_FETCH_RETRIES; attempt++) {
        try {
            transcriptList = await YoutubeTranscript.fetchTranscript(videoId, transcriptConfig);
            if (transcriptList && transcriptList.length > 0) {
                break;
            }
            console.warn(`Transcript fetch attempt ${attempt} out of ${MAX_TRANSCRIPT_FETCH_RETRIES} failed. Retrying...`);
        } catch (error) {
            console.error(`Transcript fetch failed: `, error);
        }
    }

    if (!transcriptList || transcriptList.length === 0) {
        console.warn('Failed to fetch transcript after maximum retries.');
        return null;
    }

    return transcriptList.map(item => item.text).join(' ');
};
