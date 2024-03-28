import httpStatus from "http-status";
import { ObjectId } from "mongodb";
import * as XLSX from "xlsx/xlsx.mjs";

import ApiResponse from "../services/ApiResponse.js";
import {
  bad_request_code,
  invoice_error_code,
  invoice_success_code,
  salesBook_error_code,
} from "../constants/statusCodes.js";
import { invoiceAddSchema } from "../schemas/invoiceAddSchema.js";
import InvoiceModel from "../models/invoicesModel.js";
import {
  book_not_found,
  invoice_created,
  invoice_deleted,
  invoice_exists,
  invoice_not_found,
  invoice_updated,
  invoices_added,
  success_message,
} from "../constants/messageConstants.js";
import SalesBookModel from "../models/salesBooksModel.js";
import { invoiceUpdateSchema } from "../schemas/invoiceUpdateScham.js";

// Create invoice - single
export const createInvoiceController = async (req, res) => {
  try {
    const { error, value } = invoiceAddSchema.validate(req.body);

    if (error) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(ApiResponse.error(bad_request_code, error.message));
    }

    const {
      bookId,
      invoiceNoFrom,
      invoiceNoTo,
      invoiceCreatedAt,
      invoiceAmount,
    } = value;

    const book = await SalesBookModel.findById(new ObjectId(bookId));

    if (!book) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(ApiResponse.error(salesBook_error_code, book_not_found));
    }

    const existingInvoice = await InvoiceModel.findOne({
      $and: [
        {
          $or: [
            { invoiceNoFrom: { $gte: invoiceNoFrom, $lte: invoiceNoTo } },
            { invoiceNoTo: { $gte: invoiceNoFrom, $lte: invoiceNoTo } },
            {
              $and: [
                { invoiceNoFrom: { $lte: invoiceNoFrom } },
                { invoiceNoTo: { $gte: invoiceNoTo } },
              ],
            },
          ],
        },
        { invoiceSalesBookRef: new ObjectId(book._id) },
      ],
    });

    if (existingInvoice) {
      return res
        .status(httpStatus.PRECONDITION_FAILED)
        .json(ApiResponse.error(invoice_error_code, invoice_exists));
    }

    const newInvoice = new InvoiceModel({
      invoiceNoFrom,
      invoiceNoTo,
      invoiceAmount,
      invoiceCreatedAt: new Date(invoiceCreatedAt),
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

// Update invoice
export const updateInvoiceController = async (req, res) => {
  try {
    const { error, value } = invoiceUpdateSchema.validate(req.body);

    if (error) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(ApiResponse.error(bad_request_code, error.message));
    }

    const {
      invoiceId,
      invoiceNoFrom,
      invoiceNoTo,
      invoiceCreatedAt,
      invoiceAmount,
    } = value;

    const invoice = await InvoiceModel.findById(new ObjectId(invoiceId));

    if (!invoice) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(ApiResponse.error(invoice_error_code, invoice_not_found));
    }

    if (
      invoiceNoFrom != invoice.invoiceNoFrom ||
      invoiceNoTo != invoice.invoiceNoTo
    ) {
      if (
        !(
          invoice.invoiceNoFrom <= invoiceNoFrom &&
          invoiceNoFrom <= invoice.invoiceNoTo &&
          invoice.invoiceNoFrom <= invoiceNoTo &&
          invoiceNoTo <= invoice.invoiceNoTo
        )
      ) {
        const existingInvoice = await InvoiceModel.findOne({
          $and: [
            {
              $or: [
                { invoiceNoFrom: { $gte: invoiceNoFrom, $lte: invoiceNoTo } },
                { invoiceNoTo: { $gte: invoiceNoFrom, $lte: invoiceNoTo } },
                {
                  $and: [
                    { invoiceNoFrom: { $lte: invoiceNoFrom } },
                    { invoiceNoTo: { $gte: invoiceNoTo } },
                  ],
                },
              ],
            },
            { invoiceSalesBookRef: new ObjectId(invoice.invoiceSalesBookRef) },
          ],
        });

        if (existingInvoice) {
          return res
            .status(httpStatus.PRECONDITION_FAILED)
            .json(ApiResponse.error(invoice_error_code, invoice_exists));
        }
      }

      invoice.invoiceNoFrom = invoiceNoFrom;
      invoice.invoiceNoTo = invoiceNoTo;
    }

    invoice.invoiceAmount = invoiceAmount;
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
    const { id } = req.params;

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

// Get invoices by sales books
export const invoicesBySalesBooksController = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await SalesBookModel.findById(new ObjectId(id));

    if (!book) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(ApiResponse.error(salesBook_error_code, book_not_found));
    }

    const invoices = await InvoiceModel.find({
      invoiceSalesBookRef: new ObjectId(book._id),
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

// Add bulk invoices for a salesbook
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

    for (const row of rows) {
      const rowData = row[0].split(/\s+/).map((value) => value.trim());

      const [from, to, date, amount] = rowData;

      const invoiceNoFrom = parseInt(from);
      const invoiceNoTo = parseInt(to);
      const invoiceAmount = parseFloat(amount);

      const properties = [invoiceNoFrom, invoiceNoTo, date, invoiceAmount];

      if (properties.every((value) => value !== null && value !== undefined)) {
        const existingInvoice = await InvoiceModel.findOne({
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
          const newInvoice = new InvoiceModel({
            invoiceNoFrom,
            invoiceNoTo,
            invoiceAmount,
            invoiceCreatedAt: new Date(date),
            invoiceSalesBookRef: new ObjectId(book._id),
          });

          await newInvoice.save();
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
