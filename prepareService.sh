#!/bin/bash

# Build backend part
cd ./backend/
set env='linux'
go build -o .\\bin\\ main.go
cd ..

# Build frontend part
cd ./frontend/
npm run build
cd ..