package controllers

import (
	"backend/database"
	"backend/models"
	"context"
	"crypto/sha512"
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
)

type SessionResponse struct {
	Value   string    `json:"sessionValue"`
	Expires time.Time `json:"expirationTime"`
}

func isSameFingerprint(fp1 string, fp2 string) bool {
	const optinalFieldsNumber = 4

	// Fingerprint structure:
	//
	// "fingerprint*|OS-OSVersion|Browser|CPU_Architecture|ColorDepth|ScreenResolution"
	//	* - fingerprint made by "github.com/fingerprintjs/fingerprintjs" library
	//

	fingerprint1_ValuesArray := strings.Split(fp1, "|")
	fingerprint2_ValuesArray := strings.Split(fp2, "|")

	fingerprint1 := models.Fingerprint{
		Fingerprint:      fingerprint1_ValuesArray[0],
		OS:               fingerprint1_ValuesArray[1],
		Browser:          fingerprint1_ValuesArray[2],
		CPU_Architecture: fingerprint1_ValuesArray[3],
		ColorDepth:       fingerprint1_ValuesArray[4],
		Resolution:       fingerprint1_ValuesArray[5],
	}

	fingerprint2 := models.Fingerprint{
		Fingerprint:      fingerprint2_ValuesArray[0],
		OS:               fingerprint2_ValuesArray[1],
		Browser:          fingerprint2_ValuesArray[2],
		CPU_Architecture: fingerprint2_ValuesArray[3],
		ColorDepth:       fingerprint2_ValuesArray[4],
		Resolution:       fingerprint2_ValuesArray[5],
	}

	// If OS or Browser are wrong return false
	if fingerprint1.OS != fingerprint2.OS {
		return false
	}

	if fingerprint1.Browser != fingerprint2.Browser {
		return false
	}

	var confidence float32 = 100

	if fingerprint1.Fingerprint != fingerprint2.Fingerprint {
		confidence -= 100 / optinalFieldsNumber
	}

	if fingerprint1.CPU_Architecture != fingerprint2.CPU_Architecture {
		confidence -= 100 / optinalFieldsNumber
	}

	if fingerprint1.ColorDepth != fingerprint2.ColorDepth {
		confidence -= 100 / optinalFieldsNumber
	}

	if fingerprint1.Resolution != fingerprint2.Resolution {
		confidence -= 100 / optinalFieldsNumber
	}

	return confidence >= 50.0
}

func userExists(userId string) (bool, error) {
	queryStr := "SELECT EXISTS(SELECT * FROM users WHERE id=?);"

	query, err := database.ConnectionPool.Prepare(queryStr)
	if err != nil {
		return false, err
	}

	result := query.QueryRowContext(
		context.Background(),
		userId,
	)

	var userDoesExist bool
	if err := result.Scan(&userDoesExist); err != nil {
		return false, err
	}

	return userDoesExist, nil
}

func CreateSession(userId string, deviceFingerprint string) (http.Cookie, error) {
	userDoesExists, err := userExists(userId)
	if err != nil {
		return http.Cookie{}, err
	}

	if !userDoesExists {
		return http.Cookie{}, err
	}

	sessionHash := sha512.Sum512([]byte(uuid.New().String() + userId + strconv.FormatInt(time.Now().UnixNano(), 10)))
	sessionId := base64.StdEncoding.EncodeToString(sessionHash[:])
	fmt.Print(len(sessionId))

	expirationTime := time.Now().UTC().AddDate(0, 1, 0)

	queryStr := "INSERT INTO sessions(value, userId, deviceFingerprint, expires) VALUES(?, ?, ?, ?);"
	query, err := database.ConnectionPool.Prepare(queryStr)
	if err != nil {
		return http.Cookie{}, err
	}

	_, err = query.ExecContext(
		context.Background(),
		sessionId,
		userId,
		deviceFingerprint,
		expirationTime,
	)
	if err != nil {
		return http.Cookie{}, err
	}

	return http.Cookie{
		Name:     "SESS_ID",
		Value:    sessionId,
		Expires:  expirationTime,
		Domain:   Hostname,
		Path:     "/",
		SameSite: http.SameSiteStrictMode,
		HttpOnly: true,
		// Secure: true,
	}, nil
}

func CheckSessionValid(sessionId string, deviceFingerprint string) (models.BaseResponse, error) {
	queryString := "SELECT * FROM sessions WHERE value=?;"
	query, err := database.ConnectionPool.Prepare(queryString)
	if err != nil {
		return models.BaseResponse{}, err
	}

	result := query.QueryRowContext(
		context.Background(),
		sessionId,
	)

	response := models.BaseResponse{
		IsError: false,
	}

	var sessionCookie models.SessionCookie
	if err := result.Scan(
		&sessionCookie.Value,
		&sessionCookie.UserId,
		&sessionCookie.DeviceFingerprint,
		&sessionCookie.Expires,
		&sessionCookie.Invalid,
	); err == sql.ErrNoRows {
		response.IsError = true
		response.Result = "INVALID"

		return response, nil
	} else if err != nil {
		return models.BaseResponse{}, err
	}

	// Check if session cookie is still valid
	if sessionCookie.Invalid {
		response.IsError = true
		response.Result = "INVALIDATED"

		return response, nil
	}

	// Check if request is coming from same device
	if !isSameFingerprint(deviceFingerprint, sessionCookie.DeviceFingerprint) {
		response.IsError = true
		response.Result = "IRR_DEVICE"

		return response, nil
	}

	// Check if session is expired
	if time.Now().UTC().After(sessionCookie.Expires) {
		response.IsError = true
		response.Result = "EXPIRED"

		return response, nil
	}

	// Session is valid!
	response.Result = "VALID"

	return response, nil
}

func InvalidateSession(sessionId string) (models.BaseResponse, error) {
	// Set 'invalid' field to 'true' to invalidate session
	queryString := "UPDATE sessions SET invalid=true WHERE value=?;"
	query, err := database.ConnectionPool.Prepare(queryString)
	if err != nil {
		return models.BaseResponse{}, err
	}

	result, err := query.ExecContext(
		context.Background(),
		sessionId,
	)
	if rowsAffected, _ := result.RowsAffected(); rowsAffected != 1 || err != nil {
		return models.BaseResponse{}, err
	}

	response := models.BaseResponse{
		IsError:        false,
		Result:         "SUCCESS",
		SummaryMessage: "Session invalidated.",
	}

	return response, nil
}

func CreateSessionRoute(w http.ResponseWriter, r *http.Request) {
	userId := r.URL.Query().Get("userId")
	deviceFingerprint := r.URL.Query().Get("devFingerprint")

	if userId == "" || deviceFingerprint == "" {
		SendErrorResponse(http.StatusBadRequest, "URL params aren't specified.", &w)

		return
	}

	result, err := CreateSession(userId, deviceFingerprint)
	if err != nil {
		SendErrorResponse(http.StatusInternalServerError, "Server error. Please try later.", &w)

		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(result)
}

func CheckSessionValidRoute(w http.ResponseWriter, r *http.Request) {
	// Get URL query params
	sessionIdValue := r.URL.Query().Get("sessionId")
	deviceFingerprint := r.URL.Query().Get("devFingerprint")

	if sessionIdValue == "" || deviceFingerprint == "" {
		SendErrorResponse(http.StatusBadRequest, "URL params aren't specified.", &w)

		return
	}

	result, err := CheckSessionValid(sessionIdValue, deviceFingerprint)
	if err != nil {
		SendErrorResponse(http.StatusInternalServerError, "Server error. Please try later.", &w)

		return
	}

	json.NewEncoder(w).Encode(result)
}

func InvalidateSessionRoute(w http.ResponseWriter, r *http.Request) {
	sessionIdValue := r.URL.Query().Get("sessionId")
	if sessionIdValue == "" {
		SendErrorResponse(http.StatusBadRequest, "URL params aren't specified.", &w)

		return
	}

	result, err := InvalidateSession(sessionIdValue)
	if err != nil {
		SendErrorResponse(http.StatusInternalServerError, "Server error. Please try later.", &w)

		return
	}

	json.NewEncoder(w).Encode(result)
}
