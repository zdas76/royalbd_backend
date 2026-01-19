import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { workerServices } from "./worker.services";

const createWorker = catchAsync(
    async (req, res) => {
        const result = await workerServices.createWorkerDb(req.body)
        sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Wroker Created successfully",
            data: result
        })

    }
)



export const workerController = { createWorker }