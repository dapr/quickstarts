FROM node:20-bullseye
WORKDIR /usr/src/app
COPY . .
RUN npm install
EXPOSE 4000
CMD [ "node", "app.js" ]