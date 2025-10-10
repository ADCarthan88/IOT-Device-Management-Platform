import { Router } from "express";
import { AlertsController } from "../controllers/alerts.controller.js";

const router = Router();
const controller = new AlertsController();

router.get("/", controller.getAlerts.bind(controller));
router.post("/", controller.createAlert.bind(controller));
router.put("/:id", controller.updateAlert.bind(controller));
router.delete("/:id", controller.deleteAlert.bind(controller));

export default router;