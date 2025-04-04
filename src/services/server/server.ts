import express, { Express } from 'express';
import * as http from 'http';
import { Service } from '../service';
import { ServerConfig } from './config';
import { getVideoDetails } from './youtube/getVideoDetails';
import { fetchVideoTranscript } from './youtube/getCaptions';

export class Server extends Service {
    app: Express;
    private server: http.Server;

    constructor(private readonly config: ServerConfig) {
        super();
        this.app = express();
        this.server = http.createServer(this.app);

        // Add a route to handle video details and captions
        this.app.get('/youtube/:videoId', async (req: express.Request, res: express.Response): Promise<void> => {
            const { videoId } = req.params;

            try {
                // Fetch video details
                const videoDetails = await getVideoDetails(videoId);
                if (!videoDetails) {
                    res.status(404).json({ error: 'Video not found or details unavailable.' });
                    return;
                }

                // Fetch captions
                const transcript = await fetchVideoTranscript(videoId);

                // Respond with video details and captions
                res.json({
                    videoDetails,
                    transcript: transcript || 'No transcript available.',
                });
            } catch (error: any) {
                console.error('Error processing request:', error.message);
                res.status(500).json({ error: 'Internal server error.' });
            }
        });
    }

    async start() {
        const { port } = this.config;

        return new Promise<void>((resolve, reject) => {
            this.server.listen(port, () => {
                console.log('server is running on port', port);
                resolve();
            });
            this.server.once('error', reject);
        });
    }

    async stop() {
        return new Promise<void>((resolve, reject) => {
            this.server.close((error) => (error ? reject(error) : resolve()));
        });
    }
}