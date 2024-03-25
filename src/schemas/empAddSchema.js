import Joi from "joi";
import {
  ADMIN_ROLE,
  MANAGER_ROLE,
  STAFF_ROLE,
} from "../constants/employeeRoles.js";

export const employeeRegisterSchema = Joi.object({
  empFirstName: Joi.string().required(),
  empLastName: Joi.string().required(),
  empRole: Joi.string().valid(ADMIN_ROLE, MANAGER_ROLE, STAFF_ROLE).required(),
});
