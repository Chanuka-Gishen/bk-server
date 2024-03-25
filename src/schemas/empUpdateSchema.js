import Joi from "joi";
import {
  ADMIN_ROLE,
  MANAGER_ROLE,
  STAFF_ROLE,
} from "../constants/employeeRoles.js";

export const employeeUpdateSchema = Joi.object({
  _id: Joi.string().required(),
  empFirstName: Joi.string().required(),
  empLastName: Joi.string().required(),
  empRole: Joi.string().valid(ADMIN_ROLE, MANAGER_ROLE, STAFF_ROLE).required(),
  empIsActive: Joi.boolean().required(),
});
