import Joi from "joi";

export const invoiceCreditorUpdateSchema = Joi.object({
  invoiceId: Joi.string().required(),
  invoiceNo: Joi.number().required().min(0),
  invoiceCreatedAt: Joi.date().required(),
  invoiceAmount: Joi.number().required().min(0),
});
