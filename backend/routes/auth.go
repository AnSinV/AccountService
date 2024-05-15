package routes

import (
	"backend/controllers"
	"backend/middlewares"

	"github.com/go-chi/chi/v5"
)

func AuthRoutes(router chi.Router) {
	router.Post("/signUp", controllers.SignUp)
	router.Post("/logIn", controllers.LogIn)

	router.With(middlewares.CheckUserSessionMiddleware).Get("/logOut", controllers.LogOut)
}
