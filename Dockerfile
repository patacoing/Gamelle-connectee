FROM node:latest

RUN mkdir pind

ENV TZ="Europe/Paris"

COPY ./ pind/ 

RUN npm install

CMD cd pind && npm run start

