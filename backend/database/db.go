package database

import (
	"database/sql"
	"fmt"
	"time"

	_ "github.com/go-sql-driver/mysql"
	"github.com/sirupsen/logrus"
)

type DatabaseConfig struct {
	Host         string
	Port         string
	User         string
	Password     string
	DBName       string
	MaxOpenConns int
	MaxIdleConns int
	MaxLifeTime  int
	MaxIdleTime  int
}

var ConnectionPool *sql.DB

func CreateConnectionPool(config DatabaseConfig) {
	connStr := fmt.Sprintf(
		"%s:%s@(%s:%s)/%s?parseTime=true&multiStatements=true&interpolateParams=true",
		config.User,
		config.Password,
		config.Host,
		config.Port,
		config.DBName,
	)
	logrus.Info(connStr)

	var err error

	logrus.Info("Connecting to DB...")
	ConnectionPool, err = sql.Open("mysql", connStr)
	if err != nil {
		logrus.Panic("Failed to connect to the MySQL database! Error: " + err.Error())
	}

	ConnectionPool.SetMaxOpenConns(config.MaxOpenConns)
	ConnectionPool.SetMaxIdleConns(config.MaxIdleConns)
	ConnectionPool.SetConnMaxLifetime(time.Minute * time.Duration(config.MaxLifeTime))
	ConnectionPool.SetConnMaxIdleTime(time.Minute * time.Duration(config.MaxIdleTime))

	logrus.Info("MySQL DB is ready.")
}

func CloseConnectionPool() {
	if err := ConnectionPool.Close(); err != nil {
		logrus.Panic("Failed to close MySQL connection pool! Terminating work.")
	}
}
