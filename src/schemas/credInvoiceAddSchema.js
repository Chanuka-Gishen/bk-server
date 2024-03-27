import Joi from "joi";

export const CredInvoiceAddSchema = Joi.object({
  creditorId: Joi.string().required(),
  credInvoiceNo: Joi.string().required(),
  credInvoiceDate: Joi.string().required(),
  credInvoiceAmount: Joi.number().required().min(0),
});
