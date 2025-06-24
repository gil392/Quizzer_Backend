
const RE_YOUTUBE =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
const USER_AGENT =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36,gzip(gfe)';
const RE_XML_TRANSCRIPT =
    /<text start="([^"]*)" dur="([^"]*)">([^<]*)<\/text>/g;

const INNERTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

export class YoutubeTranscriptError extends Error {
    constructor(message: string) {
        super(`[YoutubeTranscript] 🚨 ${message}`);
    }
}

export class YoutubeTranscriptTooManyRequestError extends YoutubeTranscriptError {
    constructor() {
        super(
            'YouTube is receiving too many requests from this IP and now requires solving a captcha to continue'
        );
    }
}

export class YoutubeTranscriptVideoUnavailableError extends YoutubeTranscriptError {
    constructor(videoId: string) {
        super(`The video is no longer available (${videoId})`);
    }
}

export class YoutubeTranscriptDisabledError extends YoutubeTranscriptError {
    constructor(videoId: string) {
        super(`Transcript is disabled on this video (${videoId})`);
    }
}

export class YoutubeTranscriptNotAvailableError extends YoutubeTranscriptError {
    constructor(videoId: string) {
        super(`No transcripts are available for this video (${videoId})`);
    }
}

export class YoutubeTranscriptNotAvailableLanguageError extends YoutubeTranscriptError {
    constructor(lang: string, availableLangs: string[], videoId: string) {
        super(
            `No transcripts are available in ${lang} this video (${videoId}). Available languages: ${availableLangs.join(
                ', '
            )}`
        );
    }
}

export interface TranscriptConfig {
    lang?: string;
}
export interface TranscriptResponse {
    text: string;
    duration: number;
    offset: number;
    lang?: string;
}

export class YoutubeTranscript {

    public static async fetchTranscript(
        videoId: string,
        config?: TranscriptConfig
    ): Promise<TranscriptResponse[]> {
        const identifier = this.retrieveVideoId(videoId);
        const options = {
            method: 'POST',
            headers: {
                ...(config?.lang && { 'Accept-Language': config.lang }),
                'Content-Type': 'application/json',
                Origin: 'https://www.youtube.com',
                Referer: `https://www.youtube.com/watch?v=${identifier}`
            },
            body: JSON.stringify({
                context: {
                    client: {
                        clientName: 'WEB',
                        clientVersion: '2.20240304.00.00',
                        hl: 'en',
                        gl: 'US',
                        userAgent: USER_AGENT
                    }
                },
                videoId: identifier,
                playbackContext: {
                    contentPlaybackContext: {
                        currentUrl: `/watch?v=${identifier}`,
                        vis: 0,
                        splay: false,
                        autoCaptionsDefaultOn: false,
                        autonavState: 'STATE_NONE',
                        html5Preference: 'HTML5_PREF_WANTS',
                        lactThreshold: -1
                    }
                },
                racyCheckOk: false,
                contentCheckOk: false
            }),
        }

        const InnerTubeApiResponse = await fetch(
            `https://www.youtube.com/youtubei/v1/player?key=${INNERTUBE_API_KEY}`,
            options
        );

        const { captions: { playerCaptionsTracklistRenderer: captions } } = await InnerTubeApiResponse.json();

        if (!captions) {
            throw new YoutubeTranscriptDisabledError(videoId);
        }

        if (!('captionTracks' in captions)) {
            throw new YoutubeTranscriptNotAvailableError(videoId);
        }

        if (
            config?.lang &&
            !captions.captionTracks.some(
                (track: any) => track.languageCode === config?.lang
            )
        ) {
            throw new YoutubeTranscriptNotAvailableLanguageError(
                config?.lang,
                captions.captionTracks.map((track: any) => track.languageCode),
                videoId
            );
        }

        const transcriptURL = (
            config?.lang
                ? captions.captionTracks.find(
                    (track: any) => track.languageCode === config?.lang
                )
                : captions.captionTracks[0]
        ).baseUrl;

        const transcriptResponse = await fetch(transcriptURL, {
            headers: {
                ...(config?.lang && { 'Accept-Language': config.lang }),
                'User-Agent': USER_AGENT,
            },
        });
        if (!transcriptResponse.ok) {
            throw new YoutubeTranscriptNotAvailableError(videoId);
        }
        const transcriptBody = await transcriptResponse.text();
        const results = [...transcriptBody.matchAll(RE_XML_TRANSCRIPT)];
        return results.map((result) => ({
            text: result[3],
            duration: parseFloat(result[2]),
            offset: parseFloat(result[1]),
            lang: config?.lang ?? captions.captionTracks[0].languageCode,
        }));
    }

    private static retrieveVideoId(videoId: string) {
        if (videoId.length === 11) {
            return videoId;
        }
        const matchId = videoId.match(RE_YOUTUBE);
        if (matchId && matchId.length) {
            return matchId[1];
        }
        throw new YoutubeTranscriptError(
            'Impossible to retrieve Youtube video ID.'
        );
    }
}
