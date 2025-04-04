import { google } from 'googleapis';
import { authenticate } from './authenticate';
import { YoutubeTranscript, TranscriptConfig } from 'youtube-transcript';

interface CaptionDetails {
    language: string;
    name: string;
    isAutoGenerated: boolean;
    trackId: string;
}

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

export const downloadTranscript = async (trackId: string): Promise<string | null> => {
    const oauth2Client = await authenticate();
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    try {
        const response = await youtube.captions.download({
            id: trackId,
            tfmt: 'vtt', // Specify the format
        });

        const transcriptText = response.data as string;
        console.log('Transcript:', transcriptText);
        return transcriptText;
    } catch (error) {
        console.error('Error downloading transcript:', error);
        return null;
    }
};

export const fetchVideoTranscript = async (videoId: string): Promise<string | null> => {
    const captions = await listCaptions(videoId);

    if (captions && captions.length > 0) {
        const language = captions[0].language;

        const transcriptConfig: TranscriptConfig = {
            lang: language,
        };

        try {
            const transcriptList = await YoutubeTranscript.fetchTranscript(videoId, transcriptConfig);

            if (!transcriptList || transcriptList.length === 0) {
                return null;
            }

            const transcript = transcriptList.map((item) => item.text).join(' ');
            return transcript;
        } catch (error) {
            console.error('Error fetching transcript:', error);
            return null;
        }
    } else {
        console.log('No captions available for this video.');
        return null;
    }
};
