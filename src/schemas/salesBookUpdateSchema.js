import Joi from "joi";

export const salesBookUpdateSchema = Joi.object({
  bookId: Joi.string().required(),
  bookName: Joi.string().required(),
});
