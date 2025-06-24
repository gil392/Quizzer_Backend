FROM node:slim

WORKDIR /app

COPY . .

RUN npm install
ENV NODE_ENV="production"

RUN npm run build
RUN npm prune

CMD npm run start
