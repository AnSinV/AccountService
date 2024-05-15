package main

import (
	"backend/controllers"
	"backend/database"
	"backend/routes"
	"fmt"
	"net/http"
	"os"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"
	"github.com/sirupsen/logrus"
)

type ServerConfig struct {
	hostname string
	host     string
	port     string
}

func init() {
	const envFilePath string = "./.env"
	if err := godotenv.Load(envFilePath); err != nil {
		logrus.Fatal("Failed to load .env file!")
	}
}

func getEnvStr(key string) string {
	if val, exists := os.LookupEnv(key); exists {
		return val
	}

	logrus.Fatalf("Failed to get environment variable '%s'.", key)
	return ""
}

func getEnvInt(key string) int {
	valueString := getEnvStr(key)
	if val, err := strconv.Atoi(valueString); err == nil {
		return val
	}

	logrus.Fatalf("Failed converting environment variable '%s' to type 'int'.", key)
	return -1
}

func loadServerConfig() (ServerConfig, database.DatabaseConfig) {
	logrus.Info("Loading environment variables...")

	serverConfig := ServerConfig{
		host: getEnvStr("SERVER_HOST"),
		port: getEnvStr("SERVER_PORT"),
	}

	dbConfig := database.DatabaseConfig{
		Host:         getEnvStr("DB_HOST"),
		Port:         getEnvStr("DB_PORT"),
		User:         getEnvStr("DB_USERNAME"),
		Password:     getEnvStr("DB_USER_PWD"),
		DBName:       getEnvStr("DB_NAME"),
		MaxOpenConns: getEnvInt("DB_MAX_OPEN_CONNS"),
		MaxIdleConns: getEnvInt("DB_MAX_IDLE_CONNS"),
		MaxLifeTime:  getEnvInt("DB_MAX_LIFE_TIME"),
		MaxIdleTime:  getEnvInt("DB_MAX_IDLE_TIME"),
	}

	return serverConfig, dbConfig
}

func main() {
	logrus.Info("Starting work...")

	serverConfig, dbConfig := loadServerConfig()
	controllers.Hostname = serverConfig.hostname

	logrus.Info("Connecting to the MySQL database...")
	database.CreateConnectionPool(dbConfig)
	defer database.CloseConnectionPool()

	mainRouter := chi.NewRouter()

	mainRouter.Use(middleware.Logger)
	mainRouter.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{fmt.Sprintf("https://auth.%s", serverConfig.hostname), fmt.Sprintf("http://auth.%s", serverConfig.hostname)},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	mainRouter.Route("/api/", func(router chi.Router) {
		router.Route("/auth/", routes.AuthRoutes)
		router.Route("/account/", routes.AccountRoutes)
		router.Route("/sessions/", routes.SessionRoutes)
	})

	chi.Walk(mainRouter, func(method string, route string, handler http.Handler, middlewares ...func(http.Handler) http.Handler) error {
		fmt.Printf("[%s]: '%s' has %d middlewares\n", method, route, len(middlewares))
		return nil
	})

	serverAddress := fmt.Sprintf("%s:%s", serverConfig.host, serverConfig.port)

	logrus.Info("Starting server on " + serverAddress)
	if err := http.ListenAndServe(serverAddress, mainRouter); err != nil {
		logrus.Fatal(err)
	}
}
