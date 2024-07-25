FROM node:20-bullseye
WORKDIR /usr/src/app
COPY . .
RUN npm run build
EXPOSE 8080
CMD [ "npm", "run", "start" ]
