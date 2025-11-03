import express from "express";
import { ReportControllers } from "./report.controllers";

const route = express.Router();

route.get("/ledger", ReportControllers.ladgerReport);

route.get("/party", ReportControllers.partyReport);

route.get("/party/:id", ReportControllers.partyReport);

export const ReportRouter = route;
