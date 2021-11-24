FROM node:16

WORKDIR /app
COPY server/ ./
RUN npm install 
#RUN npm test 

# Listen on port 8080
EXPOSE 8080

#ENTRYPOINT node index.js
CMD ["node", "index.js"]
