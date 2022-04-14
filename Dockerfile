FROM node:latest

RUN mkdir pind

ENV TZ="Europe/Paris"

COPY ./ pind/ 

CMD cd pind && npm run start

