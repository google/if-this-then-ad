FROM node:17-stretch

WORKDIR /app
COPY server/ ./
RUN npm install 
RUN npm test 

ENTRYPOINT node index.js
