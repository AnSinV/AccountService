FROM node:latest

WORKDIR /app
COPY ./build .
RUN npm i serve -g

EXPOSE 3000

CMD [ "serve", "-l", "3000", "-s" ]