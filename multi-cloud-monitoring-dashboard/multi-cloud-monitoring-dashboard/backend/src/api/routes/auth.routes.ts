import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";

const router = Router();
const controller = new AuthController();

router.post("/login", controller.login.bind(controller));
router.post("/logout", controller.logout.bind(controller));
router.get("/me", controller.me.bind(controller));

export default router;