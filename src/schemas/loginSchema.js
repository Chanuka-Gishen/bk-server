import Joi from "joi";

export const loginSchema = Joi.object({
  empUserName: Joi.string().required(),
  empPassword: Joi.string().required(),
});
