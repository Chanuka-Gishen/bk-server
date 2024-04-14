import Joi from "joi";
import { INVOICE_TYPES } from "../constants/invoiceTypes.js";

export const salesBookAddSchema = Joi.object({
  bookName: Joi.string().required(),
  bookType: Joi.string()
    .valid(INVOICE_TYPES.RANGE, INVOICE_TYPES.SINGLE, INVOICE_TYPES.CREDITOR)
    .required(),
});
