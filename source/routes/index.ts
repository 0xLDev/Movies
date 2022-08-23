import express from "express";
import * as controller from "../controller";

const router = express.Router();

router.get("/movies", controller.getMovies);
router.get("/movies/:movieID", controller.getDescriptionByID);

export = router;
