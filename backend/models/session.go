package models

import "time"

type SessionCookie struct {
	UserId            string
	Value             string
	DeviceFingerprint string
	Invalid           bool
	Expires           time.Time
}

type Fingerprint struct {
	Fingerprint      string
	OS               string
	Browser          string
	CPU_Architecture string
	ColorDepth       string
	Resolution       string
}
