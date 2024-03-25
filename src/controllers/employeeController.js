import httpStatus from "http-status";
import { ObjectId } from "mongodb";

import { ADMIN_ROLE } from "../constants/employeeRoles.js";
import EmployeeModel from "../models/employeeModel.js";
import ApiResponse from "../services/ApiResponse.js";
import {
  bad_request_code,
  emp_error_code,
  emp_info_code,
  emp_success_code,
} from "../constants/statusCodes.js";
import { employeeRegisterSchema } from "../schemas/empAddSchema.js";
import {
  emp_created,
  emp_exists,
  emp_not_found,
  emp_pwd_reset,
  emp_updated,
  success_message,
} from "../constants/messageConstants.js";
import { employeeUpdateSchema } from "../schemas/empUpdateSchema.js";
import { createRandomPassword } from "../services/commonServices.js";

// Create default admin
export const createDefaultAdmin = async (req, res) => {
  try {
    const empUserName = process.env.DEFAULT_ADMIN_FNAME.toLowerCase();
    const existingAdmin = await EmployeeModel.findOne({ empUserName });

    if (existingAdmin) {
      console.log("Admin exists");
      return;
    }

    const newUser = new EmployeeModel({
      empFirstName: process.env.DEFAULT_ADMIN_FNAME,
      empLastName: process.env.DEFAULT_ADMIN_LNAME,
      empUserName,
      empRole: ADMIN_ROLE,
      empPassword: process.env.DEFAULT_ADMIN_PWD,
    });

    const user = await newUser.save();
    console.log("Admin Created - " + user.empUserName);

    return;
  } catch (error) {
    console.error(error);
    return;
  }
};

// Register a employee
export const registerEmployeeController = async (req, res) => {
  try {
    const { error, value } = employeeRegisterSchema.validate(req.body);

    if (error) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(ApiResponse.error(bad_request_code, error.message));
    }

    const { empFirstName, empLastName, empRole } = value;

    const existingUser = await EmployeeModel.findOne({
      empUserName: empFirstName.toLowerCase(),
    });

    if (existingUser) {
      console.log("exists");
      return res
        .status(httpStatus.PRECONDITION_FAILED)
        .json(ApiResponse.error(emp_info_code, empFirstName + emp_exists));
    }
    console.log("not exists : " + empFirstName);

    const emp = new EmployeeModel({
      empFirstName: empFirstName,
      empLastName: empLastName,
      empUserName: empFirstName.toLowerCase(),
      empPassword: createRandomPassword(),
      empRole: empRole,
    });

    await emp.save();

    return res
      .status(httpStatus.CREATED)
      .json(ApiResponse.response(emp_success_code, emp_created));
  } catch (error) {
    console.log(error);
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(ApiResponse.error(bad_request_code, error.message));
  }
};

// Update an employee details
export const updateEmpController = async (req, res) => {
  try {
    const { error, value } = employeeUpdateSchema.validate(req.body);

    if (error) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(ApiResponse.error(bad_request_code, error.message));
    }

    const { _id, empFirstName, empLastName, empRole, empIsActive } = value;

    const user = await EmployeeModel.findById(new ObjectId(_id));

    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json(ApiResponse.error(emp_error_code, emp_not_found));
    }

    if (user.empFirstName != empFirstName) {
      const existingUser = await EmployeeModel.findOne({ empFirstName });

      if (existingUser) {
        return res
          .status(httpStatus.PRECONDITION_FAILED)
          .json(ApiResponse.error(emp_info_code, empFirstName + emp_exists));
      }

      user.empUserName = empFirstName.toLowerCase();
    }

    user.empFirstName = empFirstName;
    user.empLastName = empLastName;
    user.empRole = empRole;
    user.empIsActive = empIsActive;

    await user.save();

    return res
      .status(httpStatus.OK)
      .json(ApiResponse.response(emp_success_code, emp_updated));
  } catch (error) {
    console.log(error);
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(ApiResponse.error(bad_request_code, error.message));
  }
};

// Reset employee password
export const resetEmpPassword = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await EmployeeModel.findById(new ObjectId(id));

    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json(ApiResponse.error(emp_error_code, emp_not_found));
    }

    user.empNewPwd = true;

    await user.save();

    return res
      .status(httpStatus.OK)
      .json(ApiResponse.response(emp_success_code, emp_pwd_reset));
  } catch (error) {
    console.log(error);
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(ApiResponse.error(bad_request_code, error.message));
  }
};

// Get all users [ADMIN]
export const getEmployeesController = async (req, res) => {
  try {
    const users = await EmployeeModel.find();

    return res
      .status(httpStatus.OK)
      .json(ApiResponse.response(emp_success_code, success_message, users));
  } catch (error) {
    console.log(error);
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(ApiResponse.error(bad_request_code, error.message));
  }
};
