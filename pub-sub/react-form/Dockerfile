FROM node:8-alpine
WORKDIR /usr/src/app
COPY . .
RUN npm install
RUN cd client && npm install
EXPOSE 8080
CMD [ "npm", "run", "buildandstart" ]
