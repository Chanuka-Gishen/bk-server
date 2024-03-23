import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { excludeEmployeeFieldsPlugin } from "../plugins/employeeModelPlugin.js";
import {
  ADMIN_ROLE,
  MANAGER_ROLE,
  STAFF_ROLE,
} from "../constants/employeeRoles.js";

const Schema = mongoose.Schema;

const employeeSchema = new Schema({
  empFirstName: {
    type: String,
    required: true,
  },
  empLastName: {
    type: String,
    required: true,
  },
  empUserName: {
    type: String,
    required: true,
    unique: true,
  },
  empRole: {
    type: String,
    enum: [ADMIN_ROLE, MANAGER_ROLE, STAFF_ROLE],
    required: true,
  },
  empPassword: {
    type: String,
    required: true,
  },
  empNewPwd: {
    type: Boolean,
    required: true,
    default: true,
  },
  empIsActive: {
    type: Boolean,
    required: true,
    default: true,
  },
  empToken: {
    type: String,
    default: null,
  },
});

employeeSchema.pre("save", async function (next) {
  const employee = this;

  if (!employee.isModified("empPassword")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(employee.empPassword, salt);
    employee.empPassword = hashedPassword;
    next();
  } catch (error) {
    return next(error);
  }
});

employeeSchema.plugin(excludeEmployeeFieldsPlugin);

const EmployeeModel = mongoose.model("Employee", employeeSchema);

export default EmployeeModel;
