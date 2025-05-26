import { ServerConfig } from "../services/server/config";
import { removeEndingSlash, removeStartingSlash } from "../utils/utils";

export type FileRouterConfig = {
  domain: string;
  profileImagesDestination: string;
};

export const createFileRouterConfig = (
  serverConfig: ServerConfig
): FileRouterConfig => {
  const { domain, profileImagesDestination } = serverConfig;

  return {
    domain: removeEndingSlash(domain),
    profileImagesDestination: removeStartingSlash(profileImagesDestination),
  };
};
