"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoute = void 0;
const empoyee_controllers_1 = require("./empoyee.controllers");
const express_1 = __importDefault(require("express"));
const uploads_1 = __importDefault(require("../../../helpars/uploads"));
const employee_validation_1 = require("./employee.validation");
const route = express_1.default.Router();
route.post("/create-user", uploads_1.default.single("photo"), (req, res, next) => {
    req.body = employee_validation_1.userValidaton.createUser.parse(JSON.parse(req.body.data));
    return empoyee_controllers_1.UserControllers.createUser(req, res, next);
});
route.get("/", empoyee_controllers_1.UserControllers.getUser);
route.get("/:id", empoyee_controllers_1.UserControllers.getUserById);
route.put("/:id", uploads_1.default.single("photo"), (req, res, next) => {
    req.body = employee_validation_1.userValidaton.updateUser.parse(JSON.parse(req.body.data));
    return empoyee_controllers_1.UserControllers.updateUserById(req, res, next);
});
route.delete("/:id", empoyee_controllers_1.UserControllers.deleteUserById);
exports.UserRoute = route;
