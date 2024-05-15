package middlewares

import (
	"backend/controllers"
	"net/http"
	"time"

	"github.com/sirupsen/logrus"
)

func CheckUserSessionMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		logrus.Info(r.Cookies())

		sessionCookie, err := r.Cookie("SESS_ID")

		if err != nil || len(sessionCookie.Value) != 88 && len(sessionCookie.Value) != 0 {
			emptyCookie := http.Cookie{
				Name:     "SESS_ID",
				Value:    "",
				Expires:  time.Unix(0, 0),
				Domain:   controllers.Hostname,
				Path:     "/",
				SameSite: http.SameSiteStrictMode,
				HttpOnly: true,
				// Secure: true,
			}

			http.SetCookie(w, &emptyCookie)

			controllers.SendErrorResponse(http.StatusUnauthorized, "Token is invalid. User unauthorized!", &w)

			return
		}

		userDeviceFingerprint, err := r.Cookie("USR_DEV_FPR")
		if err != nil {
			controllers.SendErrorResponse(http.StatusBadRequest, "Invalid request body", &w)

			return
		}

		isSessionValid, err := controllers.CheckSessionValid(sessionCookie.Value, userDeviceFingerprint.Value)
		if err != nil {
			logrus.Error(err)
			controllers.SendErrorResponse(http.StatusInternalServerError, "Server error. Please try later.", &w)

			return
		}

		if isSessionValid.IsError {
			emptyCookie := http.Cookie{
				Name:     "SESS_ID",
				Value:    "",
				Expires:  time.Unix(0, 0),
				Domain:   controllers.Hostname,
				Path:     "/",
				SameSite: http.SameSiteStrictMode,
				HttpOnly: true,
				// Secure: true,
			}

			http.SetCookie(w, &emptyCookie)

			if isSessionValid.Result == "INVALID" {
				controllers.SendErrorResponse(http.StatusUnauthorized, "Your session is invalid. Please log in again.", &w)
			} else if isSessionValid.Result == "IRR_DEVICE" {
				controllers.SendErrorResponse(http.StatusUnauthorized, "Please log in again.", &w)
			} else if isSessionValid.Result == "EXPIRED" {
				controllers.SendErrorResponse(http.StatusUnauthorized, "Your session expired. Please log in again", &w)
			}

			return
		}

		next.ServeHTTP(w, r)
	})
}
