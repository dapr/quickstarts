FROM node:17-alpine
WORKDIR /usr/src/app
COPY . .
RUN npm install

# Add mini-css-extract-plugin custom install since it's not correctly installed in create-react-app
# https://github.com/facebook/create-react-app/issues/11930
RUN npm i -D --save-exact mini-css-extract-plugin@2.4.5

RUN npm run buildclient
EXPOSE 8080
EXPOSE 3000
CMD [ "npm", "run", "start" ]
