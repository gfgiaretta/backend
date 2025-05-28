FROM node:lts-alpine

WORKDIR /app

COPY package*.json ./

COPY . .

EXPOSE 8080

RUN npm ci

RUN mkdir node_modules/.cache && chmod -R 777 node_modules/.cache

CMD ["sh", "-c", "[ -d \"node_modules\" ] && npm run deploy"]
