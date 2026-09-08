FROM node:20-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY index.html manifest.json sw.js ./
COPY css ./css
COPY js ./js
COPY icons ./icons
COPY server ./server

ENV NODE_ENV=production
ENV PORT=3000
ENV DB_PATH=/data/tutoriapp.db

EXPOSE 3000
VOLUME ["/data"]

CMD ["node", "server/index.js"]
