FROM node:17-alpine
WORKDIR /usr/src/app
COPY . .
RUN npm install

# Build the client
RUN cd client && npm i && npm run build

EXPOSE 8080
EXPOSE 3000

CMD [ "npm", "run", "start" ]
