import express from "express";
import { createOrder, verifyOrder } from "../controllers/payment.controller.js";
import  isAuth  from "../middlewares/isAuth.js";

const PaymentRouter = express.Router();

PaymentRouter.post("/create-order", isAuth, createOrder);
PaymentRouter.post("/verify-order", isAuth, verifyOrder);

export default PaymentRouter;