FROM node:17-alpine
WORKDIR /usr/src/app
COPY . .
RUN npm run build
EXPOSE 8080
CMD [ "npm", "run", "start" ]
