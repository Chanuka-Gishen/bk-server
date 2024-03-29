import httpStatus from "http-status";
import { ObjectId } from "mongodb";

import PaymentModel from "../models/paymentsModel.js";
import { paymentAddSchema } from "../schemas/paymentAddSchema.js";
import ApiResponse from "../services/ApiResponse.js";
import {
  payment_error_code,
  payment_success_code,
} from "../constants/statusCodes.js";
import {
  payment_added,
  payment_deleted,
  payment_not_found,
  payment_updated,
  success_message,
} from "../constants/messageConstants.js";
import { paymentUpdateSchema } from "../schemas/paymentUpdateSchema.js";

// Add payment
export const PaymentAddController = async (req, res) => {
  try {
    const { error, value } = paymentAddSchema.validate(req.body);

    if (error) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(ApiResponse.error(bad_request_code, error.message));
    }

    const { paymentDescription, paymentAmount, paymentDate } = value;

    const newInvoice = new PaymentModel({
      paymentDescription,
      paymentAmount,
      paymentDate: new Date(paymentDate),
    });

    await newInvoice.save();

    return res
      .status(httpStatus.CREATED)
      .json(ApiResponse.response(payment_success_code, payment_added));
  } catch (error) {
    console.log(error);
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(ApiResponse.error(bad_request_code, error.message));
  }
};

// Update payment record
export const PaymentUpdateController = async (req, res) => {
  try {
    const { error, value } = paymentUpdateSchema.validate(req.body);

    if (error) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(ApiResponse.error(bad_request_code, error.message));
    }

    const { id, paymentDescription, paymentAmount, paymentDate } = value;

    const invoice = await PaymentModel.findById(new ObjectId(id));

    if (!invoice) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json(ApiResponse.error(payment_error_code, payment_not_found));
    }

    invoice.paymentDescription = paymentDescription;
    invoice.paymentAmount = paymentAmount;
    invoice.paymentDate = new Date(paymentDate);

    await invoice.save();

    return res
      .status(httpStatus.OK)
      .json(ApiResponse.response(payment_success_code, payment_updated));
  } catch (error) {
    console.log(error);
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(ApiResponse.error(bad_request_code, error.message));
  }
};

// Delete payment record
export const PaymentDeleteController = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await PaymentModel.findById(new ObjectId(id));

    if (!invoice) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json(ApiResponse.error(payment_error_code, payment_not_found));
    }

    await PaymentModel.deleteOne(invoice);

    return res
      .status(httpStatus.OK)
      .json(ApiResponse.response(payment_success_code, payment_deleted));
  } catch (error) {
    console.log(error);
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(ApiResponse.error(bad_request_code, error.message));
  }
};

// Get all payment records
export const PaymentsGetController = async (req, res) => {
  try {
    const invoices = await PaymentModel.find().sort({ paymentDate: 1 });

    return res
      .status(httpStatus.OK)
      .json(
        ApiResponse.response(payment_success_code, success_message, invoices)
      );
  } catch (error) {
    console.log(error);
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(ApiResponse.error(bad_request_code, error.message));
  }
};
