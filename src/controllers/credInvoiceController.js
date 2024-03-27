import httpStatus from "http-status";
import { ObjectId } from "mongodb";

import ApiResponse from "../services/ApiResponse.js";
import {
  bad_request_code,
  credInvoice_error_code,
  credInvoice_success_code,
  creditor_error_code,
} from "../constants/statusCodes.js";
import { CredInvoiceAddSchema } from "../schemas/credInvoiceAddSchema.js";
import CreditorModel from "../models/creditorModel.js";
import {
  credInvoice_created,
  credInvoice_not_found,
  credInvoice_updated,
  creditor_not_found,
  success_message,
} from "../constants/messageConstants.js";
import CredInvoiceModel from "../models/creditorInvoiceModel.js";
import { CredInvoiceUpdateSchema } from "../schemas/credInvoiceUpdateSchema.js";
import { PAYMENT_STATUS } from "../constants/paymentStatus.js";

// Add creditor invoice
export const addCredInvoiceController = async (req, res) => {
  try {
    const { error, value } = CredInvoiceAddSchema.validate(req.body);

    if (error) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(ApiResponse.error(bad_request_code, error.message));
    }

    const { creditorId, credInvoiceNo, credInvoiceDate, credInvoiceAmount } =
      value;

    const creditor = await CreditorModel.findById(new ObjectId(creditorId));

    if (!creditor) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(ApiResponse.error(creditor_error_code, creditor_not_found));
    }

    const credInvoiceDueDate = new Date(credInvoiceDate);

    credInvoiceDueDate.setDate(
      credInvoiceDueDate.getDate() + creditor.creditorCreditPeriod
    );

    const newInvoice = new CredInvoiceModel({
      credInvoiceNo,
      credInvoiceDate,
      credInvoiceAmount,
      credInvoiceDueDate,
      credInvoicedCreditor: creditor._id,
    });

    await newInvoice.save();

    return res
      .status(httpStatus.CREATED)
      .json(
        ApiResponse.response(credInvoice_success_code, credInvoice_created)
      );
  } catch (error) {
    console.log(error);
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(ApiResponse.error(bad_request_code, error.message));
  }
};

// Update creditor invoice
export const updateCredInvoiceController = async (req, res) => {
  try {
    const { error, value } = CredInvoiceUpdateSchema.validate(req.body);

    if (error) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(ApiResponse.error(bad_request_code, error.message));
    }

    const {
      credId,
      credInvoiceNo,
      credInvoiceDate,
      credInvoiceAmount,
      credInvoiceStatus,
      credInvoicePaidDate,
    } = value;

    const credInvoice = await CredInvoiceModel.findById(new ObjectId(credId));

    if (!credInvoice) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(ApiResponse.error(credInvoice_error_code, credInvoice_not_found));
    }

    const creditor = await CreditorModel.findById(
      new ObjectId(credInvoice.credInvoicedCreditor)
    );

    credInvoice.credInvoiceAmount = credInvoiceAmount;
    credInvoice.credInvoiceNo = credInvoiceNo;
    credInvoice.credInvoiceStatus = credInvoiceStatus;
    credInvoice.credInvoicePaidDate =
      credInvoiceStatus === PAYMENT_STATUS.PAID ? credInvoicePaidDate : null;

    if (credInvoiceDate != credInvoice.credInvoiceDate) {
      const credInvocieDueDate = new Date(credInvoiceDate);
      credInvocieDueDate.setDate(
        credInvocieDueDate.getDate() + creditor.creditorCreditPeriod
      );

      credInvoice.credInvoiceDate = credInvoiceDate;
      credInvoice.credInvoiceDueDate = credInvocieDueDate;
    }

    await credInvoice.save();

    return res
      .status(httpStatus.OK)
      .json(
        ApiResponse.response(credInvoice_success_code, credInvoice_updated)
      );
  } catch (error) {
    console.log(error);
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(ApiResponse.error(bad_request_code, error.message));
  }
};

// Get creditor invoices
export const creditorInvoicesController = async (req, res) => {
  try {
    const { id } = req.params;

    const creditor = await CreditorModel.findById(new ObjectId(id));

    if (!creditor) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(ApiResponse.error(creditor_error_code, creditor_not_found));
    }

    const invoices = await CredInvoiceModel.find({
      credInvoicedCreditor: new ObjectId(creditor._id),
    });

    return res
      .status(httpStatus.OK)
      .json(
        ApiResponse.response(
          credInvoice_success_code,
          success_message,
          invoices
        )
      );
  } catch (error) {
    console.log(error);
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(ApiResponse.error(bad_request_code, error.message));
  }
};