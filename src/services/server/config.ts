import { AuthConfig, createAuthConfig } from "../../authentication/config";
import { ProcessEnv } from "../../config";

export type ServerConfig = {
  port: number;
  authConfig: AuthConfig;
  corsOrigin?: string;
  domain: string;
  profileImagesDestination: string;
};

export const createServerConfig = (processEnv: ProcessEnv): ServerConfig => ({
  port: processEnv.PORT,
  authConfig: createAuthConfig(processEnv),
  corsOrigin: processEnv.CORS_ORIGIN,
  domain: processEnv.SERVICE_DOMAIN,
  profileImagesDestination: processEnv.PROFILE_IMAGES_DEST,
});
