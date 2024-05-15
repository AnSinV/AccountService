package models

import "time"

type User struct {
	Id          string    `json:"id"`
	Nickname    string    `json:"nickname"`
	Email       string    `json:"email"`
	Description string    `json:"description"`
	Registrated time.Time `json:"regDate"`
	LastOnline  time.Time `json:"onlineTime"`

	PwdHash string `json:"-"`
	PwdSalt string `json:"-"`
}
