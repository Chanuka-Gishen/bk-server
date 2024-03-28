import Joi from "joi";

export const invoiceUpdateSchema = Joi.object({
  invoiceId: Joi.string().required(),
  invoiceNoFrom: Joi.number().required().min(0),
  invoiceNoTo: Joi.number().required().min(0),
  invoiceCreatedAt: Joi.date().required(),
  invoiceAmount: Joi.number().required().min(0),
});
