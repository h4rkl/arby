FROM node:16

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY ./package.json ./yarn.lock ./
RUN yarn
COPY . .
RUN yarn build

EXPOSE 3000
CMD yarn start
