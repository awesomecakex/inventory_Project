FROM node:alpine3.18

RUN mkdir -p /app/

COPY . /app/

WORKDIR /app/

 
CMD ["node", "server.js"]