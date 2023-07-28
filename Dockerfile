FROM node:latest

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

ENV REDIS_HOST=redis

CMD yarn run bot:dev
