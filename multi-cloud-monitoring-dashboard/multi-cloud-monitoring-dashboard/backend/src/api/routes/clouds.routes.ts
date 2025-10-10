import { Router } from "express";
import { CloudsController } from "../controllers/clouds.controller.js";

const router = Router();
const controller = new CloudsController();

router.get("/providers", controller.getProviders.bind(controller));
router.get("/:provider/metrics", controller.getMetrics.bind(controller));

export default router;