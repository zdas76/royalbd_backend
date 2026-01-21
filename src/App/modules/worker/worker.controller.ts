import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { workerServices } from "./worker.services";

const createWorker = catchAsync(
    async (req, res) => {
        console.log(req.body)
        const result = await workerServices.createWorkerDb(req.body)
        sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Worker Created successfully",
            data: result
        })
    }
)
const getWorker = catchAsync(
    async (req, res) => {
        const result = await workerServices.getWorker()
        sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Worker Created successfully",
            data: result
        })

    }
)

const getWorkerById = catchAsync(
    async (req, res) => {
        const result = await workerServices.getWorkerByIddb(Number(req.params.id))
        sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Worker Retrieved successfully",
            data: result

        })
    }
)
const updateWorker = catchAsync(
    async (req, res) => {
        const result = await workerServices.updateWorkerDb(Number(req.params.id), req.body)
        sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Worker Updated successfully",
            data: result
        })
    }
)
const deleteWorker = catchAsync(async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
        return sendResponse(res, {
            statusCode: StatusCodes.BAD_REQUEST,
            success: false,
            message: "Invalid worker id",
            data: null,
        });
    }
    const result = await workerServices.deleteWorkerDb(id);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Worker deleted successfully",
        data: result,
    });
});

export const workerController = { createWorker, updateWorker, getWorker, deleteWorker, getWorkerById }