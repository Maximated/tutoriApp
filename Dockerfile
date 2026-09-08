FROM node:20-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY index.html ./index.html
COPY css ./css
COPY js ./js
COPY server ./server

ENV NODE_ENV=production
ENV PORT=3000
ENV DB_PATH=/data/tutoriapp.db

EXPOSE 3000
VOLUME ["/data"]

CMD ["node", "server/index.js"]
