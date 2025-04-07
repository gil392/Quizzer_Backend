import { google } from 'googleapis';
import { authenticate } from './authentication';

interface VideoDetails {
    title: string;
    channel: string;
    views: string;
    duration: string;
}

export const getVideoDetails = async (videoId: string): Promise<VideoDetails | null> => {
    const oauth2Client = await authenticate();
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    try {
        const response = await youtube.videos.list({
            part: ['snippet', 'contentDetails', 'statistics'],
            id: videoId,
        } as any);

        if (!response.data.items || response.data.items.length === 0 || !response.data.items[0]) {
            console.log('Video not found.');
            return null;
        }

        const video = response.data.items?.[0];
        const { snippet, contentDetails, statistics } = video;

        if (!snippet || !contentDetails || !statistics) {
            console.log('Incomplete video details.');
            return null;
        }

        return {
            title: snippet.title ?? 'Unknown Title',
            channel: snippet.channelTitle ?? 'Unknown Channel',
            views: statistics.viewCount || '0',
            duration: contentDetails.duration ?? 'Unknown Duration',
        };
    } catch (error) {
        console.error('Error fetching video details:', error);
        return null;
    }
};
