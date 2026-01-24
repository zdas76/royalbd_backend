"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.workerRoute = void 0;
const express_1 = require("express");
const validationRequest_1 = __importDefault(require("../../middlewares/validationRequest"));
const worker_validation_1 = require("./worker.validation");
const worker_controller_1 = require("./worker.controller");
const router = (0, express_1.Router)();
router.post("/", (0, validationRequest_1.default)(worker_validation_1.workerValidation.workerSchema), worker_controller_1.workerController.createWorker);
router.get("/", worker_controller_1.workerController.getWorker);
router.get("/:id", worker_controller_1.workerController.getWorkerById);
router.put("/:id", (0, validationRequest_1.default)(worker_validation_1.workerValidation.updateWorkerSchema), worker_controller_1.workerController.updateWorker);
router.delete("/:id", worker_controller_1.workerController.deleteWorker);
exports.workerRoute = router;
