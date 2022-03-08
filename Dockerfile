FROM node:lts-alpine

WORKDIR /app

ADD package.json package.json
ADD package-lock.json package-lock.json
ADD tsconfig.json tsconfig.json

RUN npm ci
