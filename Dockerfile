FROM node:17-stretch

RUN npm install 
RUN npm test 

ENTRYPOINT node index.js
