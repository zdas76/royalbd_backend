import { z } from "zod";
import { workerSchema } from "./worker.validation";

export type TWorker = z.infer<typeof workerSchema>