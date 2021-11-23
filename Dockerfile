FROM node:16 

RUN npm install 
RUN npm test 

ENTRYPOINT node index.js
