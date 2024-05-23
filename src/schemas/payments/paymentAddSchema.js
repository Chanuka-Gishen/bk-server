import Joi from "joi";

export const paymentAddSchema = Joi.object({
  paymentDescription: Joi.string().required(),
  paymentAmount: Joi.number().required().min(0),
  paymentDate: Joi.date().required(),
});
