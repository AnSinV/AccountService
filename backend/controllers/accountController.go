package controllers

import (
	"backend/database"
	"backend/models"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"math/rand"
	"net/http"
	"net/mail"
	"time"

	"github.com/rs/xid"
	"github.com/sirupsen/logrus"
	"golang.org/x/crypto/argon2"
)

var Hostname string

func isEmailValid(email string) bool {
	_, err := mail.ParseAddress(email)
	return err == nil
}

func generateRandomString(length int) string {
	randomWithSeed := rand.New(rand.NewSource(time.Now().UnixNano()))

	const charSet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	byteArr := make([]byte, length)

	for i := range byteArr {
		byteArr[i] = charSet[randomWithSeed.Intn(len(charSet))]
	}

	return string(byteArr)
}

func SendErrorResponse(errorCode int, message string, w *http.ResponseWriter) {
	errResponse := models.BaseResponse{
		IsError:        true,
		SummaryMessage: message,
	}

	(*w).WriteHeader(errorCode)
	json.NewEncoder(*w).Encode(errResponse)
}

func SignUp(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var newUserRegData models.SignUpRequest

	fingerprint, err := r.Cookie("USR_DEV_FPR")
	if err != nil {
		logrus.Warn(err)
		SendErrorResponse(http.StatusBadRequest, "Invalid request body", &w)

		return
	}
	newUserRegData.DeviceFingerprint = fingerprint.Value

	if err := json.NewDecoder(r.Body).Decode(&newUserRegData); err != nil {
		logrus.Warn(err)
		SendErrorResponse(http.StatusBadRequest, "Invalid request body", &w)

		return
	}

	if !isEmailValid(newUserRegData.Email) || len(newUserRegData.Nickname) == 0 || len(newUserRegData.PasswordHash) != 128 ||
		len(newUserRegData.Description) > 512 || (len(newUserRegData.DeviceFingerprint) >= 200 || len(newUserRegData.DeviceFingerprint) == 0) {
		SendErrorResponse(http.StatusBadRequest, "Invalid registration body", &w)

		return
	}

	userWithEmailExists, err := database.UserWithEmailExists(newUserRegData.Email)
	if err != nil {
		logrus.Error(err)
		SendErrorResponse(http.StatusInternalServerError, "Server error. Please try later.", &w)

		return
	}

	if userWithEmailExists {
		SendErrorResponse(http.StatusNotAcceptable, "User with this email already exists.", &w)

		return
	}

	userData := models.User{
		Id:          xid.New().String(),
		Email:       newUserRegData.Email,
		Nickname:    newUserRegData.Nickname,
		Description: newUserRegData.Description,
		PwdSalt:     generateRandomString(32),
		Registrated: time.Now().UTC(),
		LastOnline:  time.Now().UTC(),
	}

	userData.PwdHash = hex.EncodeToString(argon2.IDKey([]byte(newUserRegData.PasswordHash), []byte(userData.PwdSalt), 64*1024, 3, 2, 64))

	err = database.CreateNewUserRecord(
		userData.Id,
		userData.Email,
		userData.Nickname,
		userData.Description,
		userData.PwdSalt,
		userData.PwdHash,
		userData.Registrated,
		userData.LastOnline,
	)
	if err != nil {
		logrus.Error(err)
		SendErrorResponse(http.StatusInternalServerError, "Server error. Please try later.", &w)

		return
	}

	sessionCookie, err := CreateSession(userData.Id, newUserRegData.DeviceFingerprint)
	if err != nil {
		logrus.Error(err)
		SendErrorResponse(http.StatusInternalServerError, "Server error. Please try later.", &w)

		return
	}

	http.SetCookie(w, &sessionCookie)
	w.WriteHeader(http.StatusCreated)

	response := models.UserDataResponse{
		BaseResponse: models.BaseResponse{
			IsError:        false,
			Result:         "SUCCESS",
			SummaryMessage: "You are signed up!",
		},
		UserData: []models.User{userData},
	}

	json.NewEncoder(w).Encode(response)
}

func LogIn(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var signInData models.SignInRequest

	fingerprint, err := r.Cookie("USR_DEV_FPR")
	if err != nil {
		SendErrorResponse(http.StatusBadRequest, "Invalid request body", &w)

		return
	}
	signInData.DeviceFingerprint = fingerprint.Value

	if err := json.NewDecoder(r.Body).Decode(&signInData); err != nil {
		SendErrorResponse(http.StatusBadRequest, "Invalid request body", &w)

		return
	}

	if !isEmailValid(signInData.Email) || len(signInData.PasswordHash) != 128 || (len(signInData.DeviceFingerprint) >= 200 || len(signInData.DeviceFingerprint) == 0) {
		SendErrorResponse(http.StatusBadRequest, "Invalid authorization params", &w)

		return
	}

	userData, err := database.GetUserDataByEmail(signInData.Email)
	if err != nil {
		if err == sql.ErrNoRows {
			SendErrorResponse(http.StatusBadRequest, "Login or password is incorrect.", &w)

			return
		} else {
			logrus.Error(err)
			SendErrorResponse(http.StatusInternalServerError, "Server error. Please try later.", &w)

			return
		}
	}

	pwdHash := hex.EncodeToString(argon2.IDKey([]byte(signInData.PasswordHash), []byte(userData.PwdSalt), 64*1024, 3, 2, 64))
	if pwdHash != userData.PwdHash {
		SendErrorResponse(http.StatusBadRequest, "Login or password is incorrect.", &w)

		return
	}

	sessionCookie, err := CreateSession(userData.Id, signInData.DeviceFingerprint)
	if err != nil {
		logrus.Error(err)
		SendErrorResponse(http.StatusInternalServerError, "Server error. Please try later.", &w)

		return
	}

	http.SetCookie(w, &sessionCookie)
	w.WriteHeader(http.StatusCreated)

	response := models.UserDataResponse{
		BaseResponse: models.BaseResponse{
			IsError:        false,
			Result:         "SUCCESS",
			SummaryMessage: "You are signed up!",
		},
		UserData: []models.User{userData},
	}

	json.NewEncoder(w).Encode(response)
}

func LogOut(w http.ResponseWriter, r *http.Request) {
	sessionCookie, err := r.Cookie("SESS_ID")

	if err != nil || len(sessionCookie.Value) != 88 {
		SendErrorResponse(http.StatusBadRequest, "Invalid request body", &w)

		return
	}

	if _, err := InvalidateSession(sessionCookie.Value); err != nil {
		logrus.Error(err)
		SendErrorResponse(http.StatusInternalServerError, "Server error. Please try later.", &w)

		return
	}

	response := models.BaseResponse{
		IsError:        false,
		Result:         "SUCCESS",
		SummaryMessage: "User logged out.",
	}

	emptyCookie := http.Cookie{
		Name:     "SESS_ID",
		Value:    "",
		Expires:  time.Unix(0, 0),
		Domain:   "localhost",
		Path:     "/",
		SameSite: http.SameSiteStrictMode,
		HttpOnly: true,
		// Secure: true,
	}

	http.SetCookie(w, &emptyCookie)
	w.WriteHeader(http.StatusOK)

	json.NewEncoder(w).Encode(response)
}

func UpdateOnline(w http.ResponseWriter, r *http.Request) {
	sessionCookie, err := r.Cookie("SESS_ID")

	if err != nil || len(sessionCookie.Value) != 88 {
		SendErrorResponse(http.StatusBadRequest, "Invalid request body", &w)

		return
	}

	if err := database.RefreshUserOnlineTime(sessionCookie.Value); err != nil {
		logrus.Error(err)
		SendErrorResponse(http.StatusInternalServerError, "Server error. Please try later.", &w)

		return
	}

	w.WriteHeader(http.StatusOK)

	response := models.BaseResponse{
		IsError:        false,
		Result:         "ONLINE",
		SummaryMessage: "State updated!",
	}

	json.NewEncoder(w).Encode(response)
}

func ChangePassword(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var hashes models.ChangePasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&hashes); err != nil {
		SendErrorResponse(http.StatusBadRequest, "Invalid request body", &w)

		return
	}

	if len(hashes.OldPasswordHash) != 128 || len(hashes.NewPasswordHash) != 128 {
		SendErrorResponse(http.StatusBadRequest, "Invalid request params", &w)

		return
	}

	sessionCookie, _ := r.Cookie("SESS_ID")

	sessionData, err := database.GetSessionData(sessionCookie.Value)
	if err != nil {
		logrus.Error(err)
		SendErrorResponse(http.StatusInternalServerError, "Server error. Please try later.", &w)

		return
	}

	passwordSalt, passwordHash, err := database.GetPasswordSaltAndHash(sessionData.UserId)
	if err != nil {
		logrus.Error(err)
		SendErrorResponse(http.StatusInternalServerError, "Server error. Please try later.", &w)

		return
	}

	oldPasswordSaltedHash := hex.EncodeToString(argon2.IDKey([]byte(hashes.OldPasswordHash), []byte(passwordSalt), 64*1024, 3, 2, 64))
	if oldPasswordSaltedHash != passwordHash {
		SendErrorResponse(http.StatusBadRequest, "Old password is incorrect. Please, try again.", &w)

		return
	}

	newPasswordSaltedHash := hex.EncodeToString(argon2.IDKey([]byte(hashes.NewPasswordHash), []byte(passwordSalt), 64*1024, 3, 2, 64))

	if err := database.UpdateUserPassword(sessionData.UserId, newPasswordSaltedHash); err != nil {
		logrus.Error(err)
		SendErrorResponse(http.StatusInternalServerError, "Server error. Please try later.", &w)

		return
	}

	if hashes.ExitAllSessions {
		// TODO
	}

	response := models.BaseResponse{
		IsError:        false,
		Result:         "SUCCESS",
		SummaryMessage: "User password changed!",
	}

	json.NewEncoder(w).Encode(response)
}

func ChangeEmail(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var requestData models.ChangeEmailRequest

	if err := json.NewDecoder(r.Body).Decode(&requestData); err != nil {
		SendErrorResponse(http.StatusBadRequest, "Invalid request body", &w)

		return
	}

	if !isEmailValid(requestData.NewEmailAdress) {
		SendErrorResponse(http.StatusBadRequest, "Invalid request params", &w)

		return
	}

	sessionCookie, _ := r.Cookie("SESS_ID")

	sessionData, err := database.GetSessionData(sessionCookie.Value)
	if err != nil {
		logrus.Error(err)
		SendErrorResponse(http.StatusInternalServerError, "Server error. Please try later.", &w)

		return
	}

	err = database.UpdateUserEmail(sessionData.UserId, requestData.NewEmailAdress)
	if err != nil {
		logrus.Error(err)
		SendErrorResponse(http.StatusInternalServerError, "Server error. Please try later.", &w)

		return
	}

	response := models.BaseResponse{
		IsError:        false,
		Result:         "SUCCESS",
		SummaryMessage: "Email updated!",
	}

	json.NewEncoder(w).Encode(response)
}

func ChangeUserPublicInfo(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var requestData models.ChangePublicInfoRequest

	if err := json.NewDecoder(r.Body).Decode(&requestData); err != nil {
		SendErrorResponse(http.StatusBadRequest, "Invalid request body", &w)

		return
	}

	if len(requestData.NewNickname) > 64 || len(requestData.NewDescription) > 512 {
		SendErrorResponse(http.StatusBadRequest, "Invalid request params", &w)

		return
	}

	sessionCookie, _ := r.Cookie("SESS_ID")

	sessionData, err := database.GetSessionData(sessionCookie.Value)
	if err != nil {
		logrus.Error(err)
		SendErrorResponse(http.StatusInternalServerError, "Server error. Please try later.", &w)

		return
	}

	err = database.UpdateUserPublicInfo(sessionData.UserId, requestData.NewNickname, requestData.NewDescription)
	if err != nil {
		logrus.Error(err)
		SendErrorResponse(http.StatusInternalServerError, "Server error. Please try later.", &w)

		return
	}

	response := models.BaseResponse{
		IsError:        false,
		Result:         "SUCCESS",
		SummaryMessage: "User public info is updated!",
	}

	json.NewEncoder(w).Encode(response)
}
