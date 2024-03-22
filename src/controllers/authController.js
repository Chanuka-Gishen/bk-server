import httpStatus from "http-status";

import {
  auth_success_code,
  bad_request_code,
  emp_error_code,
} from "../constants/statusCodes.js";
import { loginSchema } from "../schemas/loginSchema.js";
import EmployeeModel from "../models/employeeModel.js";
import {
  emp_accecss_removed,
  emp_not_found,
  employee_incorrect_pwd,
  logged_in_success,
  logged_out_success,
} from "../constants/messageConstants.js";
import ApiResponse from "../services/ApiResponse.js";
import { generateToken } from "../services/jwtServices.js";

export const loginController = async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);

    if (error) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(ApiResponse.error(bad_request_code, error.message));
    }

    const { employeeUserName, employeePassword } = value;
    const user = await EmployeeModel.findOne({
      employeeUserName: employeeUserName.toLowerCase(),
    });

    if (!user)
      return res
        .status(httpStatus.OK)
        .json(ApiResponse.response(emp_error_code, emp_not_found));

    if (!user.employeeIsActive) {
      return res
        .status(httpStatus.OK)
        .json(ApiResponse.response(emp_error_code, emp_accecss_removed));
    }

    if (!user.employeeNewPwd) {
      const isMatch = await bcrypt.compare(
        employeePassword,
        user.employeePassword
      );
      if (!isMatch)
        return res
          .status(httpStatus.OK)
          .json(ApiResponse.response(emp_error_code, employee_incorrect_pwd));
    } else {
      user.employeePassword = employeePassword;
      user.employeeNewPwd = false;
    }

    const token = generateToken(user._id, user.employeeRole);

    user.employeeToken = token;

    const updatedUser = await user.save();

    delete updatedUser.employeePassword;
    return res
      .status(httpStatus.OK)
      .json(
        ApiResponse.response(auth_success_code, logged_in_success, updatedUser)
      );
  } catch (error) {
    console.log(error);
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(ApiResponse.error(bad_request_code, error.message));
  }
};

// Logout employee
export const logoutController = async (req, res) => {
  try {
    const user = await EmployeeModel.findOne({ _id: req.user.id });

    if (!user)
      return res
        .status(httpStatus.NOT_FOUND)
        .json(ApiResponse.response(emp_error_code, emp_not_found));

    user.employeeToken = null;

    await user.save();

    return res
      .status(httpStatus.OK)
      .json(ApiResponse.response(auth_success_code, logged_out_success));
  } catch (error) {
    console.log(error);
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(ApiResponse.error(bad_request_code, error.message));
  }
};