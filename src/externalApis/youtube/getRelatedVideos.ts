import { google } from 'googleapis';
import OpenAI from 'openai';
import { OpenAiConfig } from '../openAiConfig';
import { authenticate } from './authentication';
import { VideoDetails } from './getVideoDetails';

const enableRelatedVideos = process.env.ENABLE_RELATED_VIDEOS ?? false;
const openAiConfig: OpenAiConfig = { apiKey: process.env.OPENAI_API_KEY! };

export async function generateQuery(
    videoDetails: VideoDetails,
    summary: string,
): Promise<string> {
    const { title, description } = videoDetails;

    const prompt = `You are a YouTube assistant generating a concise search query to find related videos. 
Prioritize the title and summary over the description when generating the query. 
Focus on the main subject of the video and avoid unrelated information like social media links or promotions.

Title: "${title}"
Summary: "${summary}"
Description: "${description.slice(0, 100)}"

Return a 2-5 word search string that captures the main subject of the video.`

    try {
        const openAiClient = new OpenAI({ apiKey: openAiConfig.apiKey });
        const response = await openAiClient.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
        });

        if (!response.choices || response.choices.length === 0) {
            throw new Error('No choices returned from OpenAI.');
        }

        return response.choices[0].message?.content?.trim() || title;
    } catch (error) {
        console.error('Error generating search query:', error);
        throw new Error('Failed to generate search query.');
    }
}

export async function searchYouTube(
    query: string,
    excludedVideoId: string,
    excludedChannelId: string
): Promise<any[]> {
    try {
        const oauth2Client = await authenticate();
        const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

        const res = await youtube.search.list({
            part: ['snippet'],
            q: query,
            type: ['video'],
            maxResults: 10,
            relevanceLanguage: 'en',
            videoCaption: 'closedCaption',
        });

        const results = res.data.items?.filter((item) => {
            const videoId = item.id?.videoId;
            const channelId = item.snippet?.channelId;
            const title = item.snippet?.title || '';

            return (
                videoId !== excludedVideoId &&
                channelId !== excludedChannelId &&
                /^[\x00-\x7F\s]+$/.test(title) // crude ASCII/English title filter
            );
        });

        return results?.slice(0, 10) || [];
    } catch (error) {
        console.error('Error searching YouTube:', error);
        throw new Error('Failed to search YouTube.');
    }
}

export async function getRelatedVideos(
    videoId: string,
    videoDetails: VideoDetails,
    summary: string,
): Promise<any[]> {
    if (!enableRelatedVideos) {
        return [];
    }

    try {
        const query = await generateQuery(videoDetails, summary);

        return await searchYouTube(query, videoId, videoDetails?.channelId);
    } catch (error) {
        console.error('Error fetching related videos:', error);
        return [];
    }
}