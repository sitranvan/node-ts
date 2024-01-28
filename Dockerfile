# Node version 21.0.0
FROM node:21-alpine3.18 
WORKDIR /app
COPY package.json .
COPY package-lock.json .
COPY tsconfig.json .
COPY ecosystem.config.js .
COPY .env.production .
COPY ./src ./src
COPY ./swaggers ./swaggers
COPY twitter-swagger.yaml .
RUN apk add python3 
RUN npm install pm2 -g
RUN npm install
RUN npm run build

EXPOSE 3300
# Tương ứng với lệnh pm2 start ecosystem.config.js --env production
CMD ["pm2-runtime", "start", "ecosystem.config.js","--env","production"]