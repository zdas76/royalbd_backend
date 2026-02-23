import express from "express";
import { AuthRoutes } from "../modules/Auth/auth.router";
import { CategoryRouter } from "../modules/Category/category.route";
import { SubCategoryRouter } from "../modules/SubCategory/subCategory.route";
import { EmployeeRoute } from "../modules/Employee/employee.route";
import { PartyRoute } from "../modules/Party/party.route";
import { AccountItemRoute } from "../modules/AccountsItem/AccountsItem.route";
import { PhillersRoute } from "../modules/Pilliers/piller.route";
import { UnitRoute } from "../modules/unit/unit.route";
import { ProductRoute } from "../modules/products/product.route";
import { InventoryRoute } from "../modules/inventories/inventories.route";
import { RawMaterialRoute } from "../modules/rawMaterials/raw.route";
import { JournalRoute } from "../modules/journal/journal.route";
import { BankRoute } from "../modules/bank/bank.route";
import { TransactionRoute } from "../modules/bankTransaction/transaction.route";
import { CustomerRouter } from "../modules/customer/customer.route";
import { LogCategoryRoute } from "../modules/LogCategory/logCategory.route";
import { LogGradesRoutes } from "../modules/LogGrades/grades.route";
import { LogOrdersRouter } from "../modules/LogOrders/gOrder.route";
import { createProductRoute } from "../modules/createProduce/createProduct.route";
import { LogtoRawRoute } from "../modules/LogtoRowMaterial/logToRaw.route";
import { ReportRouter } from "../modules/Reports/report.route";
import { VoucherRoute } from "../modules/TransctionVoucher/transction.route";
import { UserRoute } from "../modules/User/user.route";

import { workerRoute } from "../modules/worker/worker.route";
import { VendorRoute } from "../modules/Vendor/vendor.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/category",
    route: CategoryRouter,
  },
  {
    path: "/sub-category",
    route: SubCategoryRouter,
  },
  {
    path: "/account_pillers",
    route: PhillersRoute,
  },
  {
    path: "/employee",
    route: EmployeeRoute,
  },
  {
    path: "/user",
    route: UserRoute,
  },
  {
    path: "/party",
    route: PartyRoute,
  },
  {
    path: "/accounts_item",
    route: AccountItemRoute,
  },
  {
    path: "/unit",
    route: UnitRoute,
  },
  {
    path: "/product",
    route: ProductRoute,
  },
  {
    path: "/raw_material",
    route: RawMaterialRoute,
  },
  {
    path: "/inventory",
    route: InventoryRoute,
  },
  {
    path: "/journal",
    route: JournalRoute,
  },
  {
    path: "/bank",
    route: BankRoute,
  },
  {
    path: "/transaction",
    route: TransactionRoute,
  },
  {
    path: "/customer",
    route: CustomerRouter,
  },
  {
    path: "/log",
    route: LogCategoryRoute,
  },
  {
    path: "/log-grades",
    route: LogGradesRoutes,
  },
  {
    path: "/log-orders",
    route: LogOrdersRouter,
  },
  {
    path: "/create-product",
    route: createProductRoute,
  },
  {
    path: "/log-to-raw",
    route: LogtoRawRoute,
  },
  {
    path: "/report",
    route: ReportRouter,
  },
  {
    path: "/voucher",
    route: VoucherRoute,
  },
  {
    path: "/worker",
    route: workerRoute,
  },
  {
    path: "/user",
    route: UserRoute,
  },
  {
    path: "/vendor",
    route: VendorRoute,
  }
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
