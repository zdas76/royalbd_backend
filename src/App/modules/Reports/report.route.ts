import express from "express";
import { ReportControllers } from "./report.controllers";

const route = express.Router();

route.get("/ledger", ReportControllers.ladgerReport);

route.get("/party", ReportControllers.partyReport);

route.get("/party/:id", ReportControllers.partyReport);

route.get("/raw", ReportControllers.rawReport);

// route.get("/raw/:id", ReportControllers.rawReport);

export const ReportRouter = route;
