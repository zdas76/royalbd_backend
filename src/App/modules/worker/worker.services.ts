import prisma from "../../../shared/prisma"
import { TWorker, TWorkerUpdate } from "./worker.interface"

const createWorkerDb = async (payloed: TWorker) => {
    const result = await prisma.worker.create({
        data: {
            name: payloed.name,
            nid: payloed.nid,
            address: payloed.address,
            phone: payloed.phone,
            workingPlace: payloed.workingPlace,
            dob: payloed.dob!,
        }
    })
    return result
}

const getWorker = async () => {
    const result = await prisma.worker.findMany();
    return result;
}
const getWorkerByIddb = async (id: number) => {
    const result = await prisma.worker.findUnique({
        where: { id }
    });
    return result;
}
const updateWorkerDb = async (id: number, payload: TWorkerUpdate) => {
    const result = await prisma.worker.update({
        where: { id },
        data: {
            ...(payload.name && { name: payload.name }),
            ...(payload.nid && { nid: payload.nid }),
            ...(payload.address && { address: payload.address }),
            ...(payload.phone && { phone: payload.phone }),
            ...(payload.workingPlace && { workingPlace: payload.workingPlace }),
            ...(payload.dob && { dob: new Date(payload.dob) }),
        },
    });
    return result;
};

const deleteWorkerDb = async (id: number) => {
    const result = await prisma.worker.delete({
        where: { id }
    })
    return result
}

export const workerServices = { createWorkerDb, updateWorkerDb, getWorker, deleteWorkerDb, getWorkerByIddb }