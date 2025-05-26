import swaggerJsDoc from "swagger-jsdoc";
import { ServerConfig } from "./config";

const createSwaggerOptions = (serverConfig: ServerConfig) => ({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Quizzer API",
      version: "1.0.0",
      description: "Api doc for QUizzer",
    },
    servers: [
      { url: `http://localhost:${serverConfig.port}` },
      { url: serverConfig.domain },
    ],
  },
  apis: ["./src/*.ts", "./src/**/*.ts"],
});

export const createSwaggerSpecs = (serverConfig: ServerConfig) =>
  swaggerJsDoc(createSwaggerOptions(serverConfig));
