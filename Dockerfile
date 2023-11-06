FROM node:latest

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

ENV REDIS_HOST=redis

CMD npm run bot:dev
