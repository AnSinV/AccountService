FROM golang:latest
WORKDIR /backend
COPY ./.env .
COPY ./bin/main .

EXPOSE $SERVER_PORT

CMD [ "./main" ]