"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportRouter = void 0;
const express_1 = __importDefault(require("express"));
const report_controllers_1 = require("./report.controllers");
const route = express_1.default.Router();
route.get("/ledger", report_controllers_1.ReportControllers.ladgerReport);
route.get("/party", report_controllers_1.ReportControllers.partyReport);
route.get("/party/:id", report_controllers_1.ReportControllers.partyReport);
route.get("/raw", report_controllers_1.ReportControllers.rawReport);
// route.get("/raw/:id", ReportControllers.rawReport);
exports.ReportRouter = route;
