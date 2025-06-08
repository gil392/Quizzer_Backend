import { google } from "googleapis";
import OpenAI from "openai";
import { OpenAiConfig } from "../openAiConfig";
import { authenticate } from "./authentication";
import { VideoDetails } from "./getVideoDetails";
import { parseISODurationToSeconds } from "./utils";

const enableRelatedVideos = process.env.ENABLE_RELATED_VIDEOS === "true";
const MAX_RELATED_VIDEOS = 20;
const SECONDS_IN_MINUTE = 60;
const MIN_VIDEOS_DURATION_MINUTES = 5;

const openAiConfig: OpenAiConfig = { apiKey: process.env.OPENAI_API_KEY! };

export type RelatedVideo = {
  videoId: string | undefined;
  duration: string;
  views: string;
  snippet: {
    title: string;
    description: string;
    publishTime: string;
    channelTitle: string;
    channelId: string;
    thumbnail: {
      url: string;
      width: number;
      height: number;
    };
  };
};

export async function generateQuery(
  videoDetails: VideoDetails,
  summary: string
): Promise<string> {
  const { title, description } = videoDetails;

  const prompt = `You are a YouTube assistant generating a concise search query to find related videos. 
Prioritize the title and summary over the description when generating the query. 
Focus on the main subject of the video and avoid unrelated information like social media links or promotions.

Title: "${title}"
Summary: "${summary}"
Description: "${description.slice(0, 100)}"

Return a 2-5 word search string that captures the main subject of the video.`;

  try {
    const openAiClient = new OpenAI({ apiKey: openAiConfig.apiKey });
    const response = await openAiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    if (!response.choices || response.choices.length === 0) {
      throw new Error("No choices returned from OpenAI.");
    }

    return response.choices[0].message?.content?.trim() || title;
  } catch (error) {
    console.error("Error generating search query:", error);
    throw new Error("Failed to generate search query.");
  }
}

function mapYouTubeResultsToRelatedVideos(
  results: any[],
  videoDetailsMap: Map<string, { duration?: string; views?: string }>,
  minDurationMinutes: number,
  maxResults: number,
  secondsInMinute: number
): RelatedVideo[] {
  type ItemWithVideoId = Omit<(typeof results)[number], "id"> & {
    id: { videoId: string };
  };
  const filteredResults = results.filter(
    (item): item is ItemWithVideoId => !!item.id?.videoId
  );

  return filteredResults
    .map((item) => {
      const videoId = item.id.videoId;
      const details = videoDetailsMap.get(videoId) || {};
      return {
        videoId,
        snippet: {
          title: item.snippet?.title ?? "",
          description: item.snippet?.description ?? "",
          publishTime: item.snippet?.publishedAt ?? "",
          channelTitle: item.snippet?.channelTitle ?? "",
          channelId: item.snippet?.channelId ?? "",
          thumbnail: item.snippet?.thumbnails?.default
            ? {
                url: item.snippet.thumbnails.default.url ?? "",
                width: item.snippet.thumbnails.default.width ?? 0,
                height: item.snippet.thumbnails.default.height ?? 0,
              }
            : { url: "", width: 0, height: 0 },
        },
        duration: details.duration ?? "",
        views: details.views ?? "",
      };
    })
    .filter(
      (video) =>
        parseISODurationToSeconds(video.duration) >=
        minDurationMinutes * secondsInMinute
    )
    .slice(0, maxResults);
}

export async function searchYouTube(
  query: string,
  excludedVideoId: string,
  excludedChannelId: string
): Promise<RelatedVideo[]> {
  try {
    const oauth2Client = await authenticate();
    const youtube = google.youtube({ version: "v3", auth: oauth2Client });

    const res = await youtube.search.list({
      part: ["snippet"],
      q: query,
      type: ["video"],
      maxResults: MAX_RELATED_VIDEOS,
      relevanceLanguage: "en",
      videoCaption: "closedCaption",
    });

    const results =
      res.data.items?.filter((item) => {
        const videoId = item.id?.videoId;
        const channelId = item.snippet?.channelId;
        const title = item.snippet?.title || "";

        return (
          videoId !== excludedVideoId &&
          channelId !== excludedChannelId &&
          /^[\x00-\x7F\s]+$/.test(title) // crude ASCII/English title filter
        );
      }) || [];

    const videoIds = results
      .map((item) => item.id?.videoId)
      .filter((id): id is string => !!id);

    const videoDetailsMap = new Map<
      string,
      { duration?: string; views?: string }
    >();
    if (videoIds.length > 0) {
      const videosRes = await youtube.videos.list({
        part: ["contentDetails", "statistics"],
        id: videoIds,
      });

      for (const item of videosRes.data.items || []) {
        if (item.id) {
          videoDetailsMap.set(item.id, {
            duration: item.contentDetails?.duration ?? undefined,
            views: item.statistics?.viewCount ?? undefined,
          });
        }
      }
    }

    return mapYouTubeResultsToRelatedVideos(
      results,
      videoDetailsMap,
      MIN_VIDEOS_DURATION_MINUTES,
      MAX_RELATED_VIDEOS,
      SECONDS_IN_MINUTE
    );
  } catch (error) {
    console.error("Error searching YouTube:", error);
    throw new Error("Failed to search YouTube.");
  }
}

export async function getRelatedVideos(
  videoId: string,
  videoDetails: VideoDetails,
  summary: string
): Promise<RelatedVideo[]> {
  if (!enableRelatedVideos) {
    return [];
  }

  try {
    const query = await generateQuery(videoDetails, summary);

    return await searchYouTube(query, videoId, videoDetails?.channelId);
  } catch (error) {
    console.error("Error fetching related videos:", error);
    return [];
  }
}
