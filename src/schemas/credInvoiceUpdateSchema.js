import Joi from "joi";
import { PAYMENT_STATUS } from "../constants/paymentStatus.js";

export const CredInvoiceUpdateSchema = Joi.object({
  credId: Joi.string().required(),
  credInvoiceNo: Joi.string().required(),
  credInvoiceDate: Joi.string().required(),
  credInvoiceAmount: Joi.number().required().min(0),
  credInvoiceStatus: Joi.string()
    .valid(PAYMENT_STATUS.PAID, PAYMENT_STATUS.NOTPAID)
    .required(),
  credInvoicePaidDate: Joi.string().required(),
});
