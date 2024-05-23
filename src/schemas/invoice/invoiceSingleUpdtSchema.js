import Joi from "joi";

export const invoiceSingleUpdateSchema = Joi.object({
  invoiceId: Joi.string().required(),
  invoiceNo: Joi.number().required().min(0),
  invoiceDescription: Joi.string().allow(null, ""),
  invoiceCreatedAt: Joi.date().required(),
  invoiceAmount: Joi.number().required().min(0),
});
