import Joi from "joi";

export const invoiceRangeUpdateSchema = Joi.object({
  invoiceId: Joi.string().required(),
  invoiceNoFrom: Joi.number().required().min(0),
  invoiceNoTo: Joi.number().required().min(0),
  invoiceDescription: Joi.string().allow(null, ""),
  invoiceCreatedAt: Joi.date().required(),
  invoiceAmount: Joi.number().required().min(0),
});
