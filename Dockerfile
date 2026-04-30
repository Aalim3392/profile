FROM node:22-bullseye AS build

WORKDIR /app

COPY client/package*.json ./client/
COPY server/package*.json ./server/

RUN npm ci --prefix client
RUN npm ci --prefix server

COPY client ./client
COPY server ./server

RUN npm run build --prefix client


FROM node:22-bullseye-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000
ENV CORS_ORIGIN=http://localhost:5173
ENV DATABASE_PATH=/data/hrms.db

COPY server/package*.json ./server/
RUN npm ci --omit=dev --prefix server

COPY server ./server
COPY --from=build /app/client/dist ./client/dist

EXPOSE 5000

CMD ["npm", "--prefix", "server", "start"]
