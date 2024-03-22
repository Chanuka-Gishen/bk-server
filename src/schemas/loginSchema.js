import Joi from "joi";

export const loginSchema = Joi.object({
  employeeUserName: Joi.string().required(),
  employeePassword: Joi.string().required(),
});
