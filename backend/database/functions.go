package database

import (
	"backend/models"
	"context"
	"time"
)

func UserWithEmailExists(email string) (bool, error) {
	queryStr := "SELECT EXISTS(SELECT * FROM users WHERE email=?);"
	query, err := ConnectionPool.Prepare(queryStr)
	if err != nil {
		return false, err
	}

	result := query.QueryRowContext(
		context.Background(),
		email,
	)

	var userWithEmailExists bool
	if err := result.Scan(&userWithEmailExists); err != nil {
		return false, nil
	}

	return userWithEmailExists, nil
}

func CreateNewUserRecord(
	id string,
	email string,
	nickname string,
	description string,
	passwordSalt string,
	passwordHash string,
	registrationDate time.Time,
	lastOnlineTime time.Time,
) error {
	queryStr := "INSERT INTO users(id, nickname, email, description, password_hash, password_salt, registration_date, last_online_time) VALUES(?, ?, ?, ?, ?, ?, ?, ?);"
	query, err := ConnectionPool.Prepare(queryStr)
	if err != nil {
		return err
	}

	_, err = query.ExecContext(
		context.Background(),
		id,
		nickname,
		email,
		description,
		passwordHash,
		passwordSalt,
		registrationDate,
		lastOnlineTime,
	)

	if err != nil {
		return err
	}

	return nil
}

func GetUserDataByEmail(email string) (models.User, error) {
	queryStr := "SELECT * FROM users WHERE email=?;"
	query, err := ConnectionPool.Prepare(queryStr)
	if err != nil {
		return models.User{}, err
	}

	result := query.QueryRowContext(
		context.Background(),
		email,
	)

	var userData models.User
	if err := result.Scan(
		&userData.Id,
		&userData.Nickname,
		&userData.Email,
		&userData.Description,
		&userData.PwdHash,
		&userData.PwdSalt,
		&userData.Registrated,
		&userData.LastOnline,
	); err != nil {
		return models.User{}, err
	}

	return userData, nil
}

func RefreshUserOnlineTime(sessionId string) error {
	queryString :=
		"UPDATE users SET last_online_time=CURRENT_TIMESTAMP() WHERE id=(SELECT userId FROM sessions WHERE value=?);"
	query, err := ConnectionPool.Prepare(queryString)
	if err != nil {
		return err
	}

	_, err = query.ExecContext(
		context.Background(),
		sessionId,
	)
	if err != nil {
		return err
	}

	return nil
}

func GetUserDataBySession(sessionId string) (models.User, error) {
	queryString := "SELECT * FROM users WHERE id=(SELECT userId FROM sessions WHERE value=?);"
	query, err := ConnectionPool.Prepare(queryString)
	if err != nil {
		return models.User{}, err
	}

	result := query.QueryRowContext(
		context.Background(),
		sessionId,
	)

	var userData models.User
	if err := result.Scan(
		&userData.Id,
		&userData.Nickname,
		&userData.Email,
		&userData.Description,
		&userData.PwdHash,
		&userData.PwdSalt,
		&userData.Registrated,
		&userData.LastOnline,
	); err != nil {
		return models.User{}, err
	}

	return userData, nil
}

func GetPasswordSaltAndHash(userId string) (string, string, error) {
	queryStr := "SELECT password_hash, password_salt FROM users WHERE id=?;"

	query, err := ConnectionPool.Prepare(queryStr)
	if err != nil {
		return "", "", err
	}

	result := query.QueryRowContext(
		context.Background(),
		userId,
	)

	var userPasswordHash, userPasswordSalt string
	if err := result.Scan(&userPasswordHash, &userPasswordSalt); err != nil {
		return "", "", err
	}

	return userPasswordSalt, userPasswordHash, nil
}

func GetSessionData(sessionId string) (models.SessionCookie, error) {
	queryStr := "SELECT value, userId, deviceFingerprint, expires, invalid FROM sessions WHERE value=?;"

	query, err := ConnectionPool.Prepare(queryStr)
	if err != nil {
		return models.SessionCookie{}, err
	}

	result := query.QueryRowContext(
		context.Background(),
		sessionId,
	)

	var session models.SessionCookie
	if err := result.Scan(
		&session.Value,
		&session.UserId,
		&session.DeviceFingerprint,
		&session.Expires,
		&session.Invalid,
	); err != nil {
		return models.SessionCookie{}, err
	}

	return session, nil
}

func UpdateUserPassword(userId string, newPasswordHash string) error {
	queryStr := "UPDATE users SET password_hash=? WHERE id=?;"

	query, err := ConnectionPool.Prepare(queryStr)
	if err != nil {
		return err
	}

	if _, err := query.ExecContext(
		context.Background(),
		newPasswordHash,
		userId,
	); err != nil {
		return err
	}

	return nil
}

func UpdateUserEmail(userId string, newEmail string) error {
	queryStr := "UPDATE users SET email=? WHERE id=?;"

	query, err := ConnectionPool.Prepare(queryStr)
	if err != nil {
		return err
	}

	if _, err := query.ExecContext(
		context.Background(),
		userId,
		newEmail,
	); err != nil {
		return err
	}

	return nil
}

func UpdateUserPublicInfo(userId string, nickname string, description string) error {
	queryStr := `
		UPDATE 
			users 
		SET 
			nickname=CASE WHEN ? <> '' THEN ? ELSE nickname END,
			description= CASE WHEN ? <> '' THEN ? ELSE description END
		WHERE 
			id=?;
	`

	query, err := ConnectionPool.Prepare(queryStr)
	if err != nil {
		return err
	}

	if _, err := query.ExecContext(
		context.Background(),
		nickname,
		nickname,
		description,
		description,
		userId,
	); err != nil {
		return err
	}

	return nil
}
