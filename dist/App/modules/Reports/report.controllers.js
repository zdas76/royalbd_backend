"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportControllers = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const report_service_1 = require("./report.service");
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const http_status_codes_1 = require("http-status-codes");
const ladgerReport = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield report_service_1.ReportService.getAccountLedgerReport({
        accountsItemId: Number(req.query.accountsItemId),
        startDate: req.query.startDate ? String(req.query.startDate) : null,
        endDate: req.query.endDate ? String(req.query.endDate) : null,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "Ladger report retrived successfully",
        data: result,
    });
}));
const partyReport = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield report_service_1.ReportService.partyLedgerReport({
        partyId: Number(req.query.partyId),
        startDate: req.query.startDate ? String(req.query.startDate) : null,
        endDate: req.query.endDate ? String(req.query.endDate) : null,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "Ladger report retrived successfully",
        data: result,
    });
}));
// ----------------------------------------- raw report -----------------------------
const rawReport = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield report_service_1.ReportService.rawReport({
        startDate: req.query.startDate,
        endDate: req.query.endDate,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "Ladger report retrived successfully",
        data: result,
    });
}));
exports.ReportControllers = {
    ladgerReport,
    partyReport,
    rawReport,
};
