package routes

import (
	"backend/controllers"
	"backend/middlewares"

	"github.com/go-chi/chi/v5"
)

func AccountRoutes(router chi.Router) {
	router.Group(func(protectedRouter chi.Router) {
		protectedRouter.Use(middlewares.CheckUserSessionMiddleware)

		protectedRouter.Post("/changePassword", controllers.ChangePassword)
		protectedRouter.Post("/changeEmail", controllers.ChangeEmail)
		protectedRouter.Post("/changeInfo", controllers.ChangeUserPublicInfo)
	})
}
