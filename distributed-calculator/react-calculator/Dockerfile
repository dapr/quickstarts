FROM node:17-alpine
WORKDIR /usr/src/app
COPY . .
RUN npm install

# Build the client
RUN cd client; npm i

EXPOSE 8080
EXPOSE 3000

CMD [ "npm", "run", "start" ]
