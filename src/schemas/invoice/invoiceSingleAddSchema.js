import Joi from "joi";

export const invoiceSingleAddSchema = Joi.object({
  bookId: Joi.string().required(),
  invoiceNo: Joi.number().required().min(0),
  invoiceDescription: Joi.string().allow(null, ""),
  invoiceCreatedAt: Joi.date().required(),
  invoiceAmount: Joi.number().required().min(0),
});
