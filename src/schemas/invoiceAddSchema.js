import Joi from "joi";

export const invoiceAddSchema = Joi.object({
  bookId: Joi.string().required(),
  invoiceNoFrom: Joi.number().required().min(0),
  invoiceNoTo: Joi.number().required().min(0),
  invoiceCreatedAt: Joi.date().required(),
  invoiceAmount: Joi.number().required().min(0),
});
