import Joi from "joi";

export const invoiceRangeAddSchema = Joi.object({
  bookId: Joi.string().required(),
  invoiceNoFrom: Joi.number().required().min(0),
  invoiceNoTo: Joi.number().required().min(0),
  invoiceDescription: Joi.string().allow(null),
  invoiceCreatedAt: Joi.date().required(),
  invoiceInAmount: Joi.number().required().min(0),
  invoiceOutAmount: Joi.number().required().min(0),
});
