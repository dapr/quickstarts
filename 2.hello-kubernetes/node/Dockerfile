FROM node:8-alpine
WORKDIR /app
COPY .dockerfiles .
RUN npm install
EXPOSE 3000
CMD [ "node", "app.js" ]
