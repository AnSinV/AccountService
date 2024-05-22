#!/bin/bash

# Build backend part

cd ./backend/
go env -w GOOS='linux'
go build -o ./bin/ main.go
cd ..

# Build frontend part

cd ./frontend/
npm install
npm run build
cd ..