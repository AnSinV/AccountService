rem Build backend part

cd ./backend
go env -w GOOS=linux
go build -o .\\bin\\ main.go
cd ..

rem Build frontend part

cd ./frontend
call npm run build
cd ..