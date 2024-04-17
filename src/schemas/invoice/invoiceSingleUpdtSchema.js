import Joi from "joi";

export const invoiceSingleUpdateSchema = Joi.object({
  invoiceId: Joi.string().required(),
  invoiceNo: Joi.number().required().min(0),
  invoiceDescription: Joi.string().allow(null),
  invoiceCreatedAt: Joi.date().required(),
  invoiceInAmount: Joi.number().required().min(0),
  invoiceOutAmount: Joi.number().required().min(0),
});
