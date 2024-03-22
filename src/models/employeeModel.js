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
  employeeFirstName: {
    type: String,
    required: true,
  },
  employeeLastName: {
    type: String,
    required: true,
  },
  employeeUserName: {
    type: String,
    required: true,
    unique: true,
  },
  employeeRole: {
    type: String,
    enum: [ADMIN_ROLE, MANAGER_ROLE, STAFF_ROLE],
    required: true,
  },
  employeePassword: {
    type: String,
    required: true,
  },
  employeeNewPwd: {
    type: Boolean,
    required: true,
    default: true,
  },
  employeeIsActive: {
    type: Boolean,
    required: true,
    default: true,
  },
  employeeToken: {
    type: String,
    default: null,
  },
});

employeeSchema.pre("save", async function (next) {
  const employee = this;

  if (!employee.isModified("employeePassword")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(employee.employeePassword, salt);
    employee.employeePassword = hashedPassword;
    next();
  } catch (error) {
    return next(error);
  }
});

employeeSchema.plugin(excludeEmployeeFieldsPlugin);

const EmployeeModel = mongoose.model("Employee", employeeSchema);

export default EmployeeModel;
