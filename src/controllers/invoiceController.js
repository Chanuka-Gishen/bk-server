import httpStatus from "http-status";
import { ObjectId } from "mongodb";
import * as XLSX from "xlsx/xlsx.mjs";

import ApiResponse from "../services/ApiResponse.js";
import {
  bad_request_code,
  invoice_error_code,
  invoice_info_code,
  invoice_success_code,
  salesBook_error_code,
} from "../constants/statusCodes.js";
import { invoiceRangeAddSchema } from "../schemas/invoice/invoiceRangeAddSchema.js";

import {
  book_not_found,
  credInvoice_not_found,
  invoice_already_paid,
  invoice_balance_not_invalid,
  invoice_created,
  invoice_deleted,
  invoice_exists,
  invoice_invalid_type,
  invoice_not_found,
  invoice_updated,
  invoices_added,
  success_message,
} from "../constants/messageConstants.js";
import SalesBookModel from "../models/salesBooksModel.js";
import InvoiceRangeModel from "../models/invoiceRangeModel.js";
import { invoiceSingleAddSchema } from "../schemas/invoice/invoiceSingleAddSchema.js";
import InvoiceSingleModel from "../models/invoiceSingleModel.js";
import { invoiceCreditorAddSchema } from "../schemas/invoice/invoiceCreditorAddScehama.js";
import InvoiceCreditorModel from "../models/invoiceCreditorModel.js";
import CredInvoiceModel from "../models/creditorInvoiceModel.js";
import { invoiceSingleUpdateSchema } from "../schemas/invoice/invoiceSingleUpdtSchema.js";
import { invoiceRangeUpdateSchema } from "../schemas/invoice/invoiceRangeUpdtSchema.js";
import { invoiceCreditorUpdateSchema } from "../schemas/invoice/invoiceCreditorUpdtSchema.js";
import { INVOICE_TYPES } from "../constants/invoiceTypes.js";
import { PAYMENT_STATUS } from "../constants/paymentStatus.js";
import CashBalanceModel from "../models/cashBalanceModel.js";
import { excelSerialDateToJSDate } from "../services/commonServices.js";

const createInvoice = async (req, res, InvoiceModel, schema, type) => {
  try {
    const { error, value } = schema.validate(req.body);

    if (error) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(ApiResponse.error(bad_request_code, error.message));
    }

    const { bookId, ...invoiceData } = value;

    const book = await SalesBookModel.findById(new ObjectId(bookId));

    if (!book) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(ApiResponse.error(salesBook_error_code, book_not_found));
    }

    let existingInvoice;

    if (type === INVOICE_TYPES.RANGE) {
      existingInvoice = await InvoiceRangeModel.findOne({
        $and: [
          {
            $or: [
              {
                invoiceNoFrom: {
                  $gte: invoiceData.invoiceNoFrom,
                  $lte: invoiceData.invoiceNoTo,
                },
              },
              {
                invoiceNoTo: {
                  $gte: invoiceData.invoiceNoFrom,
                  $lte: invoiceData.invoiceNoTo,
                },
              },
              {
                $and: [
                  { invoiceNoFrom: { $lte: invoiceData.invoiceNoFrom } },
                  { invoiceNoTo: { $gte: invoiceData.invoiceNoTo } },
                ],
              },
            ],
          },
          { invoiceSalesBookRef: new ObjectId(book._id) },
        ],
      });
    } else if (type === INVOICE_TYPES.SINGLE) {
      existingInvoice = await InvoiceModel.findOne({
        invoiceSalesBookRef: new ObjectId(book._id),
        invoiceNo: invoiceData.invoiceNo,
      });
    }

    if (existingInvoice) {
      return res
        .status(httpStatus.PRECONDITION_FAILED)
        .json(ApiResponse.error(invoice_error_code, invoice_exists));
    }

    const newInvoice = new InvoiceModel({
      ...invoiceData,
      invoiceCreatedAt: new Date(invoiceData.invoiceCreatedAt),
      invoiceSalesBookRef: new ObjectId(book._id),
    });

    await newInvoice.save();

    return res
      .status(httpStatus.OK)
      .json(ApiResponse.response(invoice_success_code, invoice_created));
  } catch (error) {
    console.log(error);
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(ApiResponse.error(bad_request_code, error.message));
  }
};

export const createInvoiceRangeController = async (req, res) => {
  return createInvoice(
    req,
    res,
    InvoiceRangeModel,
    invoiceRangeAddSchema,
    INVOICE_TYPES.RANGE
  );
};

export const createInvoiceSingleController = async (req, res) => {
  return createInvoice(
    req,
    res,
    InvoiceSingleModel,
    invoiceSingleAddSchema,
    INVOICE_TYPES.SINGLE
  );
};

// Create invoice - Creditor payments
export const createInvoiceCreditorController = async (req, res) => {
  try {
    const { error, value } = invoiceCreditorAddSchema.validate(req.body);

    if (error) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(ApiResponse.error(bad_request_code, error.message));
    }

    const { credInvoiceId, invoiceNo, invoiceCreatedAt, invoiceAmount } = value;

    const existingCreditorInvoice = await CredInvoiceModel.findById(
      new ObjectId(credInvoiceId)
    );

    if (!existingCreditorInvoice) {
      return res
        .status(httpStatus.PRECONDITION_FAILED)
        .json(ApiResponse.error(invoice_error_code, credInvoice_not_found));
    }

    const existingInvoice = await InvoiceCreditorModel.findOne({
      invoiceCreditorRef: new ObjectId(
        existingCreditorInvoice.credInvoicedCreditor
      ),
      invoiceNo: invoiceNo,
    });

    if (existingInvoice) {
      return res
        .status(httpStatus.PRECONDITION_FAILED)
        .json(ApiResponse.error(invoice_error_code, invoice_exists));
    }

    if (
      parseFloat(existingCreditorInvoice.credInvoiceBalance) <
      parseFloat(invoiceAmount)
    ) {
      return res
        .status(httpStatus.PRECONDITION_FAILED)
        .json(
          ApiResponse.error(invoice_error_code, invoice_balance_not_invalid)
        );
    }

    const newInvoice = new InvoiceCreditorModel({
      invoiceNo,
      invoiceAmount,
      invoiceCreatedAt: new Date(invoiceCreatedAt),
      invoiceCreditorInvoiceRef: new ObjectId(credInvoiceId),
      invoiceCreditorRef: new ObjectId(
        existingCreditorInvoice.credInvoicedCreditor
      ),
    });

    const savedInvoice = await newInvoice.save();

    const balance =
      existingCreditorInvoice.credInvoiceBalance - savedInvoice.invoiceAmount;

    existingCreditorInvoice.credInvoiceBalance = balance;

    if (balance === 0) {
      existingCreditorInvoice.credInvoiceStatus = PAYMENT_STATUS.PAID;
      existingCreditorInvoice.credInvoicePaidDate = new Date();
    }

    await existingCreditorInvoice.save();

    return res
      .status(httpStatus.OK)
      .json(ApiResponse.response(invoice_success_code, invoice_created));
  } catch (error) {
    console.log(error);
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(ApiResponse.error(bad_request_code, error.message));
  }
};

// Update invoice - Range
export const updateInvoiceController = async (req, res) => {
  try {
    const { type } = req.params;
    let schema, InvoiceModel;

    switch (type) {
      case INVOICE_TYPES.RANGE:
        schema = invoiceRangeUpdateSchema;
        InvoiceModel = InvoiceRangeModel;
        break;
      case INVOICE_TYPES.SINGLE:
        schema = invoiceSingleUpdateSchema;
        InvoiceModel = InvoiceSingleModel;
        break;
      default:
        return res
          .status(httpStatus.BAD_REQUEST)
          .json(ApiResponse.error(bad_request_code, invoice_invalid_type));
    }

    const { error, value } = schema.validate(req.body);

    if (error) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(ApiResponse.error(bad_request_code, error.message));
    }

    const { invoiceId, ...updateData } = value;

    const invoice = await InvoiceModel.findById(new ObjectId(invoiceId));

    if (!invoice) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(ApiResponse.error(invoice_error_code, invoice_not_found));
    }

    let existingInvoices;

    if (type === INVOICE_TYPES.RANGE) {
      if (
        value.invoiceNoFrom != invoice.invoiceNoFrom ||
        value.invoiceNoTo != invoice.invoiceNoTo
      ) {
        if (
          !(
            invoice.invoiceNoFrom <= value.invoiceNoFrom &&
            value.invoiceNoFrom <= invoice.invoiceNoTo &&
            invoice.invoiceNoFrom <= value.invoiceNoTo &&
            value.invoiceNoTo <= invoice.invoiceNoTo
          )
        ) {
          existingInvoices = await InvoiceRangeModel.findOne({
            $and: [
              {
                $or: [
                  {
                    invoiceNoFrom: {
                      $gte: value.invoiceNoFrom,
                      $lte: value.invoiceNoTo,
                    },
                  },
                  {
                    invoiceNoTo: {
                      $gte: value.invoiceNoFrom,
                      $lte: value.invoiceNoTo,
                    },
                  },
                  {
                    $and: [
                      { invoiceNoFrom: { $lte: value.invoiceNoFrom } },
                      { invoiceNoTo: { $gte: value.invoiceNoTo } },
                    ],
                  },
                ],
              },
              {
                invoiceSalesBookRef: new ObjectId(invoice.invoiceSalesBookRef),
              },
            ],
          });
        }
      }
    } else if (type === INVOICE_TYPES.SINGLE) {
      if (value.invoiceNo != invoice.invoiceNo) {
        existingInvoices = await InvoiceSingleModel.findOne({
          invoiceSalesBookRef: new ObjectId(invoice.invoiceSalesBookRef),
          invoiceNo: value.invoiceNo,
        });
      }
    }

    if (existingInvoices) {
      return res
        .status(httpStatus.PRECONDITION_FAILED)
        .json(ApiResponse.error(invoice_error_code, invoice_exists));
    }

    Object.assign(invoice, updateData);

    await invoice.save();

    return res
      .status(httpStatus.OK)
      .json(ApiResponse.response(invoice_success_code, invoice_updated));
  } catch (error) {
    console.log(error);
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(ApiResponse.error(bad_request_code, error.message));
  }
};

// Update invoice - creditor
export const updateInvoiceCreditorController = async (req, res) => {
  try {
    const { error, value } = invoiceCreditorUpdateSchema.validate(req.body);

    if (error) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(ApiResponse.error(bad_request_code, error.message));
    }

    const { invoiceId, invoiceNo, invoiceCreatedAt, invoiceAmount } = value;

    const invoice = await InvoiceCreditorModel.findById(
      new ObjectId(invoiceId)
    );

    if (!invoice) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(ApiResponse.error(invoice_error_code, invoice_not_found));
    }

    const mainInvoice = await CredInvoiceModel.findById(
      new ObjectId(invoice.invoiceCreditorInvoiceRef)
    );

    if (!mainInvoice) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(ApiResponse.error(invoice_error_code, invoice_not_found));
    }

    if (mainInvoice.credInvoiceStatus === PAYMENT_STATUS.PAID) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(ApiResponse.error(invoice_info_code, invoice_already_paid));
    }

    if (invoiceAmount != invoice.invoiceAmount) {
      const newValue = invoiceAmount - invoice.invoiceAmount;

      if (
        mainInvoice.credInvoiceBalance <
        newValue + mainInvoice.credInvoiceBalance
      ) {
        return res
          .status(httpStatus.PRECONDITION_FAILED)
          .json(
            ApiResponse.error(invoice_error_code, invoice_balance_not_invalid)
          );
      }

      mainInvoice.credInvoiceBalance += newValue;

      if (mainInvoice.credInvoiceBalance + newValue === 0) {
        mainInvoice.credInvoiceStatus = PAYMENT_STATUS.PAID;
        mainInvoice.credInvoicePaidDate = new Date();
      }

      await mainInvoice.save();
    }

    invoice.invoiceAmount = invoiceAmount;
    invoice.invoiceNo = invoiceNo;
    invoice.invoiceCreatedAt = new Date(invoiceCreatedAt);

    await invoice.save();

    return res
      .status(httpStatus.OK)
      .json(ApiResponse.response(invoice_success_code, invoice_updated));
  } catch (error) {
    console.log(error);
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(ApiResponse.error(bad_request_code, error.message));
  }
};

// Delete invoice
export const deleteInvoiceController = async (req, res) => {
  try {
    const { id, type } = req.params;

    let InvoiceModel;

    // Determine the appropriate model based on the 'type' parameter
    switch (type) {
      case INVOICE_TYPES.RANGE:
        InvoiceModel = InvoiceRangeModel;
        break;
      case INVOICE_TYPES.SINGLE:
        InvoiceModel = InvoiceSingleModel;
        break;
      default:
        return res
          .status(httpStatus.BAD_REQUEST)
          .json(ApiResponse.error(invoice_error_code, invoice_invalid_type));
    }

    const invoice = await InvoiceModel.findById(new ObjectId(id));

    if (!invoice) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(ApiResponse.error(invoice_error_code, invoice_not_found));
    }

    await InvoiceModel.deleteOne(invoice);

    return res
      .status(httpStatus.OK)
      .json(ApiResponse.response(invoice_success_code, invoice_deleted));
  } catch (error) {
    console.log(error);
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(ApiResponse.error(bad_request_code, error.message));
  }
};

// Delete creditor payment invoice
export const deleteCreditorPaymentController = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await InvoiceCreditorModel.findById(new ObjectId(id));

    if (!invoice) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(ApiResponse.error(invoice_error_code, invoice_not_found));
    }

    const mainInvoice = await CredInvoiceModel.findById(
      new ObjectId(invoice.invoiceCreditorInvoiceRef)
    );

    if (!mainInvoice) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(ApiResponse.error(invoice_error_code, invoice_not_found));
    }

    const newBalance = mainInvoice.credInvoiceBalance + invoice.invoiceAmount;

    mainInvoice.credInvoiceBalance = newBalance;
    mainInvoice.credInvoiceStatus = PAYMENT_STATUS.NOTPAID;
    mainInvoice.credInvoicePaidDate = null;

    await mainInvoice.save();

    await InvoiceCreditorModel.deleteOne(invoice);

    return res
      .status(httpStatus.OK)
      .json(ApiResponse.response(invoice_success_code, invoice_deleted));
  } catch (error) {
    console.log(error);
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(ApiResponse.error(bad_request_code, error.message));
  }
};

// Get invoices by sales books
export const invoicesBySalesBooksController = async (req, res) => {
  try {
    const { id, type } = req.params;
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const date = req.body.filteredDate;

    const skip = page * limit;

    let book;

    if (type != INVOICE_TYPES.CREDITOR) {
      book = await SalesBookModel.findById(new ObjectId(id));

      if (!book) {
        return res
          .status(httpStatus.BAD_REQUEST)
          .json(ApiResponse.error(salesBook_error_code, book_not_found));
      }
    }

    let invoices;
    let documentCount;

    const pipeline = [
      {
        $match: {
          invoiceSalesBookRef: new ObjectId(book._id),
        },
      },
      {
        $sort: {
          invoiceCreatedAt: 1,
        },
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

      pipeline[0].$match = {
        invoiceCreatedAt: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      };
    }

    switch (type) {
      case INVOICE_TYPES.RANGE:
        invoices = await InvoiceRangeModel.aggregate(pipeline);
        documentCount = await InvoiceRangeModel.countDocuments();
        break;
      case INVOICE_TYPES.SINGLE:
        invoices = await InvoiceSingleModel.aggregate(pipeline);
        documentCount = await InvoiceSingleModel.countDocuments();
        break;
      default:
        break;
    }

    return res.status(httpStatus.OK).json(
      ApiResponse.response(invoice_success_code, success_message, {
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

// Get creditor payments invoices - credInvoice ID
export const getCreditorPaymentsInvoices = async (req, res) => {
  try {
    const { id } = req.params;

    const invoices = await InvoiceCreditorModel.find({
      invoiceCreditorInvoiceRef: new ObjectId(id),
    });

    return res
      .status(httpStatus.OK)
      .json(
        ApiResponse.response(invoice_success_code, success_message, invoices)
      );
  } catch (error) {
    console.log(error);
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(ApiResponse.error(bad_request_code, error.message));
  }
};

// Get the total payments filtered by date for creditora payments
export const getTotalPaymentsFilteredByDateController = async (req, res) => {
  try {
    const filteredDate = req.body.filteredDate;

    let date;

    if (filteredDate) {
      date = new Date(filteredDate);
    } else {
      date = new Date();
    }

    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const totalAmount = await InvoiceCreditorModel.aggregate([
      {
        $match: {
          invoiceCreatedAt: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$invoiceAmount" }, // Calculate sum of the invoiceAmount field
        },
      },
    ]);

    return res
      .status(httpStatus.OK)
      .json(
        ApiResponse.response(
          invoice_success_code,
          success_message,
          totalAmount.length > 0 ? totalAmount[0].total : 0
        )
      );
  } catch (error) {
    console.log(error);
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(ApiResponse.error(bad_request_code, error.message));
  }
};

// Get invoices by salesbooks total in and out amount filtered by date
export const totalSalesFilteredByDateController = async (req, res) => {
  try {
    const { id, type } = req.params;
    const date = req.body.filteredDate || new Date();

    const filteredDate = new Date(date);
    const startOfDay = new Date(filteredDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(filteredDate.setHours(23, 59, 59, 999));

    let result;

    const commonPipeline = [
      {
        $match: {
          invoiceSalesBookRef: new ObjectId(id),
          invoiceCreatedAt: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalInAmount: { $sum: "$invoiceInAmount" },
          totalOutAmount: { $sum: "$invoiceOutAmount" },
        },
      },
      {
        $project: {
          _id: 0,
          totalInAmount: 1,
          totalOutAmount: 1,
          netAmount: { $subtract: ["$totalInAmount", "$totalOutAmount"] }, // Calculate net in-out value
        },
      },
    ];

    switch (type) {
      case INVOICE_TYPES.RANGE:
        result = await InvoiceRangeModel.aggregate(commonPipeline);
        break;
      case INVOICE_TYPES.SINGLE:
        result = await InvoiceSingleModel.aggregate(commonPipeline);
        break;
      default:
        result = null;
        break;
    }

    const response = {
      totalInAmount: result && result.length > 0 ? result[0].totalInAmount : 0,
      totalOutAmount:
        result && result.length > 0 ? result[0].totalOutAmount : 0,
      netAmount: result && result.length > 0 ? result[0].netAmount : 0,
    };

    return res
      .status(httpStatus.OK)
      .json(
        ApiResponse.response(invoice_success_code, success_message, response)
      );
  } catch (error) {
    console.log(error);
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(ApiResponse.error(bad_request_code, error.message));
  }
};

// Add bulk invoices for a salesbook - Range
export const addBulkInvoicesForSalesBook = async (req, res) => {
  try {
    const { id } = req.params;
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" }); // Parse from buffer
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const book = await SalesBookModel.findById(new ObjectId(id));

    if (!book) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(ApiResponse.error(salesBook_error_code, book_not_found));
    }

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length > 0) {
        if (book.bookType === INVOICE_TYPES.RANGE) {
          const [from, to, description, date, amountIn, amountOut] = row;

          const invoiceNoFrom = parseInt(from);
          const invoiceNoTo = parseInt(to);
          const invoiceInAmount = parseFloat(amountIn ? amountIn : 0);
          const invoiceOutAmount = parseFloat(amountOut ? amountOut : 0);

          const createdDate = excelSerialDateToJSDate(date);

          const existingInvoice = await InvoiceRangeModel.findOne({
            $and: [
              {
                $or: [
                  { invoiceNoFrom: { $gte: from, $lte: to } },
                  { invoiceNoTo: { $gte: from, $lte: to } },
                  {
                    $and: [
                      { invoiceNoFrom: { $lte: from } },
                      { invoiceNoTo: { $gte: to } },
                    ],
                  },
                ],
              },
              { invoiceSalesBookRef: new ObjectId(book._id) },
            ],
          });

          if (!existingInvoice) {
            const newInvoice = new InvoiceRangeModel({
              invoiceNoFrom,
              invoiceNoTo,
              invoiceDesciption: description,
              invoiceInAmount,
              invoiceOutAmount,
              invoiceCreatedAt: new Date(createdDate),
              invoiceSalesBookRef: new ObjectId(book._id),
            });

            await newInvoice.save();
          }
        } else if (book.bookType === INVOICE_TYPES.SINGLE) {
          const [invoice, description, date, amountIn, amountOut] = row;

          const invoiceNo = parseInt(invoice);
          const invoiceInAmount = parseFloat(amountIn ? amountIn : 0);
          const invoiceOutAmount = parseFloat(amountOut ? amountOut : 0);

          const createdDate = excelSerialDateToJSDate(date);

          const existingInvoice = await InvoiceSingleModel.findOne({
            invoiceSalesBookRef: new ObjectId(book._id),
            invoiceNo: invoiceNo,
          });

          if (!existingInvoice) {
            const newInvoice = new InvoiceSingleModel({
              invoiceNo,
              invoiceDesciption: description,
              invoiceInAmount,
              invoiceOutAmount,
              invoiceCreatedAt: new Date(createdDate),
              invoiceSalesBookRef: new ObjectId(book._id),
            });

            await newInvoice.save();
          }
        }
      }
    }

    return res
      .status(httpStatus.OK)
      .json(ApiResponse.response(invoice_success_code, invoices_added));
  } catch (error) {
    console.log(error);
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(ApiResponse.error(bad_request_code, error.message));
  }
};
