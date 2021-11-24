FROM node:16 AS builder

WORKDIR /build
COPY server/ ./

# adding global temporarily
RUN npm install -g tsc
RUN npm run build-dist

FROM builder as dist 
WORKDIR /app
COPY /dist /app 

#Listen on port 8080
EXPOSE 8080

CMD ["node", "index.js"]
