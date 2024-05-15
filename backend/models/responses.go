package models

type BaseResponse struct {
	IsError        bool   `json:"isError"`
	Result         string `json:"result"`
	SummaryMessage string `json:"message,omitempty"`
}

type UserDataResponse struct {
	BaseResponse
	UserData []User `json:"userData"`
}
