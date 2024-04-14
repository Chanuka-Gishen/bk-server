import Joi from "joi";

export const invoiceCreditorAddSchema = Joi.object({
  credInvoiceId: Joi.string().required(),
  invoiceNo: Joi.number().required().min(0),
  invoiceCreatedAt: Joi.date().required(),
  invoiceAmount: Joi.number().required().min(0),
});
