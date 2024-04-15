FROM node:18-alpine

# RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

# USER root

RUN npm install

COPY  . .

# RUN node utils/generate-data --uploadtours

EXPOSE 5555

CMD ["node", "app.js"]