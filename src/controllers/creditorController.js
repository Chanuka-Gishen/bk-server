import httpStatus from "http-status";
import { ObjectId } from "mongodb";

import ApiResponse from "../services/ApiResponse.js";
import {
  bad_request_code,
  creditor_error_code,
  creditor_success_code,
} from "../constants/statusCodes.js";
import { creditorSchema } from "../schemas/creditorSchema.js";
import CreditorModel from "../models/creditorModel.js";
import {
  creditor_created,
  creditor_exists,
  creditor_not_found,
  creditor_updated,
  success_message,
} from "../constants/messageConstants.js";
import { creditorUpdateSchema } from "../schemas/creditorUpdateSchema.js";

// Create creditor
export const createCreditorController = async (req, res) => {
  try {
    const { error, value } = creditorSchema.validate(req.body);

    if (error) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(ApiResponse.error(bad_request_code, error.message));
    }

    const {
      creditorName,
      creditorCity,
      creditorOrganization,
      creditorMobilePrimary,
      creditorMobileSecondary,
      creditorCreditPeriod,
    } = value;

    const userName = generateCreditorUserName(creditorName, creditorCity);

    const existingCreditor = await CreditorModel.findOne({
      creditorUserName: userName,
    });

    if (existingCreditor) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(ApiResponse.error(bad_request_code, creditor_exists));
    }

    const newCreditor = new CreditorModel({
      creditorName,
      creditorCity,
      creditorUserName: userName,
      creditorOrganization,
      creditorMobilePrimary,
      creditorMobileSecondary,
      creditorCreditPeriod,
    });

    await newCreditor.save();

    return res
      .status(httpStatus.OK)
      .json(ApiResponse.response(creditor_success_code, creditor_created));
  } catch (error) {
    console.log(error);
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(ApiResponse.error(bad_request_code, error.message));
  }
};

// Update creditor details
export const updateCreditorController = async (req, res) => {
  try {
    const { error, value } = creditorUpdateSchema.validate(req.body);

    if (error) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(ApiResponse.error(bad_request_code, error.message));
    }

    const {
      id,
      creditorName,
      creditorCity,
      creditorOrganization,
      creditorMobilePrimary,
      creditorMobileSecondary,
      creditorCreditPeriod,
    } = value;

    const creditor = await CreditorModel.findById(new ObjectId(id));

    if (!creditor) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(ApiResponse.error(creditor_error_code, creditor_not_found));
    }

    if (
      creditorName != creditor.creditorName ||
      creditorCity != creditor.creditorCity
    ) {
      creditor.creditorUserName = generateCreditorUserName(
        creditorName,
        creditorCity
      );
    }

    creditor.creditorName = creditorName;
    creditor.creditorCity = creditorCity;
    creditor.creditorOrganization = creditorOrganization;
    creditor.creditorMobilePrimary = creditorMobilePrimary;
    creditor.creditorMobileSecondary = creditorMobileSecondary;
    creditor.creditorCreditPeriod = creditorCreditPeriod;

    await creditor.save();

    return res
      .status(httpStatus.OK)
      .json(ApiResponse.response(creditor_success_code, creditor_updated));
  } catch (error) {
    console.log(error);
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(ApiResponse.error(bad_request_code, error.message));
  }
};

// Get all creditors
export const getAllCreditorsController = async (req, res) => {
  try {
    const creditors = await CreditorModel.find();

    return res
      .status(httpStatus.OK)
      .json(
        ApiResponse.response(creditor_success_code, success_message, creditors)
      );
  } catch (error) {
    console.log(error);
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(ApiResponse.error(bad_request_code, error.message));
  }
};

// Get creditor by id
export const getCreditorDetailsController = async (req, res) => {
  try {
    const { id } = req.params;

    const creditor = await CreditorModel.findById(new ObjectId(id));

    if (!creditor) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(ApiResponse.error(creditor_error_code, creditor_not_found));
    }

    return res
      .status(httpStatus.OK)
      .json(
        ApiResponse.response(creditor_success_code, success_message, creditor)
      );
  } catch (error) {
    console.log(error);
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(ApiResponse.error(bad_request_code, error.message));
  }
};

// Generate user name
const generateCreditorUserName = (name, city) => {
  const nameCode = name.slice(0, 3).toUpperCase();
  const cityCode = city.slice(0, 3).toUpperCase();

  return nameCode + cityCode;
};
