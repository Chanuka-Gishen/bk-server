import Joi from "joi";

export const paymentUpdateSchema = Joi.object({
  id: Joi.string().required(),
  paymentDescription: Joi.string().required(),
  paymentAmount: Joi.number().required().min(0),
  paymentDate: Joi.date().required(),
});
