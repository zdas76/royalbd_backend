import { z } from "zod";
import { updateWorkerSchema, workerSchema } from "./worker.validation";

export type TWorker = z.infer<typeof workerSchema>["body"];

export type TWorkerUpdate = z.infer<typeof updateWorkerSchema>["body"];