import { google, Auth } from 'googleapis';
import fs from 'fs';
import path from 'path';

// Paths to the credentials and token files
const CREDENTIALS_PATH = path.resolve(__dirname, '../../../youtube-credentials.json');
const TOKEN_PATH = path.resolve(__dirname, '../../../youtube-token.json');

const loadCredentials = (): { client_id: string; client_secret: string; redirect_uris: string[] } => {
    if (!fs.existsSync(CREDENTIALS_PATH)) {
        throw new Error(`Credentials file not found at ${CREDENTIALS_PATH}`);
    }

    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));

    return credentials.web;
};

const createOAuth2Client = (): Auth.OAuth2Client => {
    const { client_secret, client_id, redirect_uris } = loadCredentials();

    return new google.auth.OAuth2(client_id, client_secret, redirect_uris[1]);
};

const loadToken = (): Auth.Credentials => {
    if (!fs.existsSync(TOKEN_PATH)) {
        throw new Error(`Token file not found at ${TOKEN_PATH}`);
    }

    return JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
};

const saveToken = (tokens: Auth.Credentials): void => {
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
};

const refreshAccessToken = async (oauth2Client: Auth.OAuth2Client): Promise<void> => {
    try {
        const token = loadToken();
        oauth2Client.setCredentials(token);

        oauth2Client.on('tokens', (newTokens) => {
            const updated = { ...token, ...newTokens };
            saveToken(updated);
            console.log('Token auto-refreshed and saved.');
        });

        const accessTokenResponse = await oauth2Client.getAccessToken();
        console.log('Access token:', accessTokenResponse?.token || 'Unknown');
    } catch (error: any) {
        console.error('Error refreshing access token:', error.message);
        throw error;
    }
};

// Function to authenticate and get the OAuth2 client
export const authenticate = async (): Promise<Auth.OAuth2Client> => {
    try {
        const oauth2Client = createOAuth2Client();
        await refreshAccessToken(oauth2Client);

        return oauth2Client;
    } catch (error: any) {
        console.error('Error during authentication:', error.message);
        throw error;
    }
};