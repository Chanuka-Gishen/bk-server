import { ADMIN_ROLE } from "../constants/employeeRoles.js";
import EmployeeModel from "../models/employeeModel.js";

export const createDefaultAdmin = async (req, res) => {
  try {
    const employeeUserName = process.env.DEFAULT_ADMIN_FNAME.toLowerCase();
    const existingAdmin = await EmployeeModel.findOne({ employeeUserName });

    if (existingAdmin) {
      console.log("Admin exists");
      return;
    }

    const newUser = new EmployeeModel({
      employeeFirstName: process.env.DEFAULT_ADMIN_FNAME,
      employeeLastName: process.env.DEFAULT_ADMIN_LNAME,
      employeeUserName,
      employeeRole: ADMIN_ROLE,
      employeePassword: process.env.DEFAULT_ADMIN_PWD,
    });

    const user = await newUser.save();
    console.log("Admin Created - " + user.employeeUserName);

    return;
  } catch (error) {
    console.error(error);
    return;
  }
};
