import Joi from "joi";

export const creditorSchema = Joi.object({
  creditorName: Joi.string().required(),
  creditorCity: Joi.string().required(),
  creditorOrganization: Joi.string().allow(null, ""),
  creditorMobilePrimary: Joi.string().required(),
  creditorMobileSecondary: Joi.string().allow(null, ""),
  creditorCreditPeriod: Joi.number().required().min(0),
});
