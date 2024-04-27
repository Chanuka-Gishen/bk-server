import Joi from "joi";

export const cashBalanceAddSchema = Joi.object({
  cashBalanceDate: Joi.date().required(),
  openingBalance: Joi.number().required(),
});
