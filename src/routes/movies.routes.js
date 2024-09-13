const { Router } = require("express");

const MoviesController = require("../controllers/MoviesController");
const ensureAuthenticated = require("../middleware/ensureAuthenticated");

const moviesRoutes = Router();

const moviesController = new MoviesController();

moviesRoutes.use(ensureAuthenticated);

moviesRoutes.get("/", moviesController.index);
moviesRoutes.get("/:id", moviesController.show);
moviesRoutes.post("/", moviesController.create);
moviesRoutes.delete("/:id", moviesController.delete);

module.exports = moviesRoutes;