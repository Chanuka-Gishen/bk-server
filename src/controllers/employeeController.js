import { ADMIN_ROLE } from "../constants/employeeRoles.js";
import EmployeeModel from "../models/employeeModel.js";

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
