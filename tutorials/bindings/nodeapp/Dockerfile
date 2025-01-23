FROM node:20-bullseye
WORKDIR /app
COPY . /app
RUN rm -rf ./components
RUN npm install
EXPOSE 3000
CMD [ "node", "app.js" ]