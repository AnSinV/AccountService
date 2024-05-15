package routes

import (
	"backend/controllers"
	"backend/middlewares"

	"github.com/go-chi/chi/v5"
)

func SessionRoutes(router chi.Router) {
	router.With(middlewares.CheckUserSessionMiddleware).Get("/updOnline", controllers.UpdateOnline)

	router.Group(func(privateRouter chi.Router) {
		privateRouter.Use()

		privateRouter.Get("/create", controllers.CreateSessionRoute)
		privateRouter.Get("/checkValid", controllers.CheckSessionValidRoute)
		privateRouter.Get("/invalidate", controllers.InvalidateSessionRoute)
	})
}
