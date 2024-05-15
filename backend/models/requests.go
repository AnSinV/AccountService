package models

type SignUpRequest struct {
	Email             string `json:"email"`
	Nickname          string `json:"nickname"`
	Description       string `json:"description"`
	PasswordHash      string `json:"pwdHash"`
	DeviceFingerprint string `json:"devFingerprint"`
}

type SignInRequest struct {
	Email             string `json:"email"`
	PasswordHash      string `json:"pwdHash"`
	DeviceFingerprint string `json:"devFingerprint"`
}

type ChangePasswordRequest struct {
	OldPasswordHash string `json:"oldPwdHash"`
	NewPasswordHash string `json:"newPwdHash"`
	ExitAllSessions bool   `json:"endAllSessions"`
}

type ChangeEmailRequest struct {
	NewEmailAdress string `json:"newEmail"`
}

type ChangePublicInfoRequest struct {
	NewNickname    string `json:"newNickname"`
	NewDescription string `json:"newDescription"`
}
