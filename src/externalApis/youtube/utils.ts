export const extractVideoId = (url: string): string | null => {
    const regex = /(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
};
