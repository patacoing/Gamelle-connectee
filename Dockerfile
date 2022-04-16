FROM node:latest

RUN mkdir /pind

WORKDIR /pind


ENV TZ Europe/Paris
RUN apt update && apt install tzdata -y

ENV PRODUCTION="true"

COPY ./ ./

RUN npm install

CMD npm run start

