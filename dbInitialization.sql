CREATE DATABASE IF NOT EXISTS main_database;

USE main_database;

CREATE TABLE IF NOT EXISTS users (
	id CHAR(20) PRIMARY KEY NOT NULL UNIQUE,
    nickname VARCHAR(64) NOT NULL,
    email VARCHAR(256) NOT NULL,
    description VARCHAR(512) NOT NULL,
    password_hash CHAR(128) NOT NULL,
    password_salt CHAR(32) NOT NULL,
    registration_date DATE NOT NULL,
    last_online_time DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
	value CHAR(128) PRIMARY KEY NOT NULL UNIQUE,
    userId CHAR(20) NOT NULL,
    deviceFingerprint char(128) NOT NULL,
    expires DATETIME NOT NULL,
    invalid TINYINT NOT NULL DEFAULT 0,
    FOREIGN KEY(userId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS files (
	id CHAR(20) PRIMARY KEY NOT NULL UNIQUE,
    owner_id CHAR(20) NOT NULL,
    original_filename VARCHAR(256) NOT NULL,
    private BOOLEAN NOT NULL,
    size BIGINT NOT NULL,
    color_share_code VARCHAR(256) NOT NULL,
    upload_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(owner_id) REFERENCES users(id)
);