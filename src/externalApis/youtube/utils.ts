import { BadRequestError } from "../../services/server/exceptions";

export function extractVideoId(youtubeUrl: string): string {
    const patterns = [
        /(?:v=|\/)([0-9A-Za-z_-]{11}).*/,      // Standard and shared URLs
        /(?:embed\/)([0-9A-Za-z_-]{11})/,       // Embed URLs
        /(?:youtu\.be\/)([0-9A-Za-z_-]{11})/,   // Shortened URLs
        /(?:shorts\/)([0-9A-Za-z_-]{11})/,      // YouTube Shorts
        /^([0-9A-Za-z_-]{11})$/                 // Just the video ID
    ];

    const url = youtubeUrl.trim();

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            return match[1];
        }
    }

    throw new BadRequestError("Could not extract video ID from URL");
}

export function parseISODurationToSeconds(isoDuration: string): number {
    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
    const [, h = "0", m = "0", s = "0"] = regex.exec(isoDuration) || [];
    return parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s);
}