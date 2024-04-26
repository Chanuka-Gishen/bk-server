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
  invoice_deleted,
  invoice_invalid_amount,
  success_message,
} from "../constants/messageConstants.js";
import CredInvoiceModel from "../models/creditorInvoiceModel.js";
import { CredInvoiceUpdateSchema } from "../schemas/credInvoiceUpdateSchema.js";
import { PAYMENT_STATUS } from "../constants/paymentStatus.js";
import InvoiceCreditorModel from "../models/invoiceCreditorModel.js";

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
      credInvoiceBalance: credInvoiceAmount,
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

    const paymentInvoices = await InvoiceCreditorModel.find({
      invoiceCreditorInvoiceRef: new ObjectId(credInvoice._id),
    });
    const totalPayments = paymentInvoices.reduce(
      (total, invoice) => total + invoice.invoiceAmount,
      0
    );

    const creditor = await CreditorModel.findById(
      new ObjectId(credInvoice.credInvoicedCreditor)
    );

    if (totalPayments > credInvoiceAmount) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(
          ApiResponse.error(credInvoice_error_code, invoice_invalid_amount)
        );
    }

    const difference = credInvoiceAmount - credInvoice.credInvoiceAmount;
    const newBalance = difference + credInvoice.credInvoiceBalance;

    credInvoice.credInvoiceAmount = credInvoiceAmount;
    credInvoice.credInvoiceBalance = newBalance;
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

// Delete creditor invoice
export const creditorInvoiceDeleteController = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await CredInvoiceModel.findById(new ObjectId(id));

    if (!invoice) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(ApiResponse.error(credInvoice_error_code, credInvoice_not_found));
    }

    await InvoiceCreditorModel.deleteMany({
      invoiceCreditorInvoiceRef: new ObjectId(invoice._id),
    });

    await CredInvoiceModel.deleteOne(invoice);

    return res
      .status(httpStatus.OK)
      .json(ApiResponse.response(credInvoice_success_code, invoice_deleted));
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

    const invoices = await CredInvoiceModel.aggregate([
      {
        $match: {
          credInvoicedCreditor: new ObjectId(creditor._id),
        },
      },
      {
        $lookup: {
          from: "creditorinvoices",
          localField: "_id",
          foreignField: "invoiceCreditorInvoiceRef",
          as: "invoices",
        },
      },
      {
        $sort: { credInvoiceDueDate: 1 },
      },
    ]);

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

// Get all creditors invoices and payment invoices
export const getAllCredInvoicesController = async (req, res) => {
  try {
    const date = req.body.filteredDate;
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    const skip = page * limit;

    const pipeline = [
      {
        $lookup: {
          from: "creditors",
          localField: "credInvoicedCreditor",
          foreignField: "_id",
          as: "creditor",
        },
      },
      {
        $unwind: "$creditor",
      },
      {
        $lookup: {
          from: "creditorinvoices",
          localField: "_id",
          foreignField: "invoiceCreditorInvoiceRef",
          as: "invoices",
        },
      },
      {
        $match: {},
      },
      {
        $sort: { credInvoiceDueDate: 1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ];

    if (date) {
      const filterDate = new Date(date);
      const startOfDay = new Date(filterDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(filterDate.setHours(23, 59, 59, 999));

      pipeline[3].$match = {
        "invoices.invoiceCreatedAt": {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      };
    }

    const invoices = await CredInvoiceModel.aggregate(pipeline);

    const count = await CredInvoiceModel.countDocuments();

    return res.status(httpStatus.OK).json(
      ApiResponse.response(credInvoice_success_code, success_message, {
        invoices,
        count,
      })
    );
  } catch (error) {
    console.log(error);
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(ApiResponse.error(bad_request_code, error.message));
  }
};

// Filter creditors invoices - from remaings no of days []
export const filterCreInvoicessByDaysController = async (req, res) => {
  try {
    const dateFrom = new Date(req.body.dateFrom);
    const dateTo = new Date(req.body.dateTo);

    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = page * limit;

    const startOfDay = new Date(dateFrom.setHours(0, 0, 0, 0));
    const endOfDay = new Date(dateTo.setHours(23, 59, 59, 999));

    const query = {
      credInvoiceStatus: PAYMENT_STATUS.NOTPAID,
      credInvoiceDueDate: { $gte: startOfDay, $lte: endOfDay },
    };

    let invoices = await CredInvoiceModel.find(query)
      .populate("credInvoicedCreditor")
      .sort({ credInvoiceDueDate: 1 })
      .skip(skip)
      .limit(limit);

    const documentCount = await CredInvoiceModel.countDocuments(query);

    return res.status(httpStatus.OK).json(
      ApiResponse.response(credInvoice_success_code, success_message, {
        documentCount,
        invoices,
      })
    );
  } catch (error) {
    console.log(error);
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(ApiResponse.error(bad_request_code, error.message));
  }
};
