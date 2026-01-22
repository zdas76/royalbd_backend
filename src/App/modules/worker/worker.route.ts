import { Router } from "express";
import validationRequiest from "../../middlewares/validationRequest";
import { workerValidation } from "./worker.validation";
import { workerController } from "./worker.controller";

const router = Router();

router.post("/", validationRequiest(workerValidation.workerSchema), workerController.createWorker);
router.get("/", workerController.getWorker);
router.get("/:id", workerController.getWorkerById);
router.put("/:id", validationRequiest(workerValidation.updateWorkerSchema), workerController.updateWorker);
router.delete("/:id", workerController.deleteWorker);
export const workerRoute = router