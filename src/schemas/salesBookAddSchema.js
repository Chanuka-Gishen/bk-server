import Joi from "joi";

export const salesBookAddSchema = Joi.object({
  bookName: Joi.string().required(),
});
