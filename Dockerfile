FROM node:latest

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install
RUN yarn global add ts-node-dev

COPY . .

ENV REDIS_HOST=redis

CMD yarn run bot:dev
