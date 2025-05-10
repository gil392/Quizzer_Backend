import { google } from 'googleapis';
import OpenAI from 'openai';
import { OpenAiConfig } from '../openAiConfig';
import { authenticate } from './authentication';
import { VideoDetails } from './getVideoDetails';

const enableRelated = process.env.ENABLE_RELATED_VIDEOS === 'true';

const openai = (openAiConfig: OpenAiConfig) =>
    new OpenAI({ apiKey: openAiConfig.apiKey });

export async function generateQuery(
    videoDetails: VideoDetails,
    summary: string,
    openAiConfig: OpenAiConfig
): Promise<string> {
    const { title, description, tags } = videoDetails;

    const prompt = `You are a YouTube assistant generating a concise search query to find related educational videos. 
Based on this data, return a 5–10 word search string. Do not repeat the title.

Title: "${title}"
Description: "${description.slice(0, 300)}"
Tags: ${tags?.join(', ') || 'None'}
Summary: ${summary}

Search Query:`;

    try {
        const openAiClient = openai(openAiConfig);
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
            maxResults: 20,
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
    openAiConfig: OpenAiConfig,
): Promise<any[]> {
    if (!enableRelated) {
        console.log('Related videos feature is disabled.');
        return [];
    }

    try {
        const query = await generateQuery(videoDetails, summary, openAiConfig);

        return await searchYouTube(query, videoId, videoDetails?.channelId);
    } catch (error) {
        console.error('Error fetching related videos:', error);
        return [];
    }
}