import Joi from "joi";

export const cashBalanceUpdateSchema = Joi.object({
  id: Joi.string().required(),
  openingBalance: Joi.number().required(),
});
