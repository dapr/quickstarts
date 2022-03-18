FROM node:17-alpine
WORKDIR /app
COPY . /app
RUN rm -rf ./components
RUN npm install
EXPOSE 3000
CMD [ "node", "app.js" ]