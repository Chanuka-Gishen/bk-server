import httpStatus from "http-status";
import { ObjectId } from "mongodb";
import PDFDocument from "pdfkit";

import ApiResponse from "../services/ApiResponse.js";
import {
  bad_request_code,
  salesBook_error_code,
  salesBook_success_code,
} from "../constants/statusCodes.js";
import { salesBookAddSchema } from "../schemas/salesBookAddSchema.js";
import SalesBookModel from "../models/salesBooksModel.js";
import {
  book_exists,
  book_not_found,
  success_message,
} from "../constants/messageConstants.js";
import { createSequence, updateSequence } from "./sequenceController.js";
import { salesBookUpdateSchema } from "../schemas/salesBookUpdateSchema.js";
import { calculateNetAmount } from "./cashBalanceController.js";
import CashBalanceModel from "../models/cashBalanceModel.js";
import InvoiceSingleModel from "../models/invoiceSingleModel.js";
import InvoiceRangeModel from "../models/invoiceRangeModel.js";
import InvoiceCreditorModel from "../models/invoiceCreditorModel.js";
import { fDate } from "../services/commonServices.js";
import { generateInvoiceSummaryPDF } from "../services/pdfServices.js";

// Create new sales book
export const createSalesBookController = async (req, res) => {
  try {
    const { error, value } = salesBookAddSchema.validate(req.body);

    if (error) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(ApiResponse.error(bad_request_code, error.message));
    }

    const { bookName, bookType } = value;

    const existingBook = await SalesBookModel.findOne({ bookName });

    if (existingBook) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(ApiResponse.error(bad_request_code, book_exists));
    }

    const sequence = await createSequence(bookName);

    if (!sequence) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(ApiResponse.error(bad_request_code, book_exists));
    }

    const newBook = new SalesBookModel({
      bookName,
      bookType,
      bookSequence: new ObjectId(sequence._id),
    });

    await newBook.save();

    return res
      .status(httpStatus.OK)
      .json(ApiResponse.response(salesBook_success_code, success_message));
  } catch (error) {
    console.log(error);
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(ApiResponse.error(bad_request_code, error.message));
  }
};

// Update sales book - name only
export const updateSalesBookController = async (req, res) => {
  try {
    const { error, value } = salesBookUpdateSchema.validate(req.body);

    if (error) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(ApiResponse.error(bad_request_code, error.message));
    }

    const { bookId, bookName } = value;

    const book = await SalesBookModel.findById(new ObjectId(bookId));

    if (!book) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(ApiResponse.error(salesBook_error_code, book_not_found));
    }

    if (bookName != book.bookName) {
      const existingBook = await SalesBookModel.findOne({ bookName });

      if (existingBook) {
        return res
          .status(httpStatus.BAD_REQUEST)
          .json(ApiResponse.error(bad_request_code, book_exists));
      }

      const sequence = await updateSequence(book.bookSequence, bookName);

      if (!sequence) {
        return res
          .status(httpStatus.BAD_REQUEST)
          .json(ApiResponse.error(bad_request_code, book_exists));
      }

      book.bookName = bookName;
      book.bookSequence = new ObjectId(sequence._id);

      await book.save();
    }

    return res
      .status(httpStatus.OK)
      .json(
        ApiResponse.response(salesBook_success_code, success_message, book)
      );
  } catch (error) {
    console.log(error);
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(ApiResponse.error(bad_request_code, error.message));
  }
};

// Get all sales books
export const getSalesBooksController = async (req, res) => {
  try {
    const salesBooks = await SalesBookModel.find().populate("bookSequence");

    return res
      .status(httpStatus.OK)
      .json(
        ApiResponse.response(
          salesBook_success_code,
          success_message,
          salesBooks
        )
      );
  } catch (error) {
    console.log(error);
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(ApiResponse.error(bad_request_code, error.message));
  }
};

// Get total cash balance today
export const getTotalCashBalanceController = async (req, res) => {
  try {
    const currentDate = new Date();
    const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(currentDate.setHours(23, 59, 59, 999));

    const totalFromInvoices = await calculateNetAmount(currentDate);
    const openingBalance = await CashBalanceModel.findOne({
      cashBalanceDate: { $gte: startOfDay, $lte: endOfDay },
    });

    const total = totalFromInvoices ? totalFromInvoices : 0;
    const balance = openingBalance ? openingBalance.openingBalance : 0;

    const response = total + balance;

    return res
      .status(httpStatus.OK)
      .json(
        ApiResponse.response(salesBook_success_code, success_message, response)
      );
  } catch (error) {
    console.log(error);
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(ApiResponse.error(bad_request_code, error.message));
  }
};

// Download invoices report
export const downloadInvoicesReportController = async (req, res) => {
  try {
    const date = req.query.date;

    const filteredDate = new Date(date);
    const startDate = new Date(filteredDate.setHours(0, 0, 0, 0));
    const endDate = new Date(filteredDate.setHours(23, 59, 59, 999));

    const query = {
      invoiceCreatedAt: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    const openingBalanceResult = await CashBalanceModel.findOne({
      cashBalanceDate: { $gte: startDate, $lte: endDate },
    });

    const singleInvoices = await InvoiceSingleModel.find(query);

    const singleResultTotalIn = singleInvoices.reduce(
      (acc, invoice) => acc + invoice.invoiceInAmount,
      0
    );
    const singleResultTotalOut = singleInvoices.reduce(
      (acc, invoice) => acc + invoice.invoiceOutAmount,
      0
    );

    const rangeInvoices = await InvoiceRangeModel.find(query);

    const rangeResultTotalIn = rangeInvoices.reduce(
      (acc, invoice) => acc + invoice.invoiceInAmount,
      0
    );
    const rangeResultTotalOut = rangeInvoices.reduce(
      (acc, invoice) => acc + invoice.invoiceOutAmount,
      0
    );

    const credInvoices = await InvoiceCreditorModel.find(query)
      .populate("invoiceCreditorRef")
      .populate("invoiceCreditorInvoiceRef");

    const credInvoicesTotal = credInvoices.reduce(
      (acc, invoice) => acc + invoice.invoiceAmount,
      0
    );

    const salesBooksAndInvoices = await SalesBookModel.aggregate([
      {
        $lookup: {
          from: "rangeinvoices",
          localField: "_id",
          foreignField: "invoiceSalesBookRef",
          pipeline: [
            {
              $match: {
                invoiceCreatedAt: {
                  $gte: startDate,
                  $lte: endDate,
                },
              },
            },
          ],
          as: "rangeinvoices",
        },
      },
      {
        $lookup: {
          from: "singleinvoices",
          localField: "_id",
          foreignField: "invoiceSalesBookRef",
          pipeline: [
            {
              $match: {
                invoiceCreatedAt: {
                  $gte: startDate,
                  $lte: endDate,
                },
              },
            },
          ],
          as: "singleinvoices",
        },
      },
    ]);

    const totalInvoicesAmountIn =
      (rangeResultTotalIn ? rangeResultTotalIn : 0) +
      (singleResultTotalIn ? singleResultTotalIn : 0);

    const totalInvoicesAmountOut =
      (rangeResultTotalOut ? rangeResultTotalOut : 0) +
      (singleResultTotalOut ? singleResultTotalOut : 0);

    const totalInvoicesAmount = totalInvoicesAmountIn - totalInvoicesAmountOut;

    const totalWithCredPayments = totalInvoicesAmount + credInvoicesTotal;

    const grossTotal = openingBalanceResult
      ? openingBalanceResult.openingBalance
      : 0 + totalWithCredPayments;

    // Create a new PDF document
    const doc = new PDFDocument({ bufferPages: true, size: "A4", margin: 50 });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=${fDate(filteredDate)}-report.pdf`
    );

    // Stream the PDF buffer to the response
    doc.pipe(res);

    generateInvoiceSummaryPDF(
      doc,
      filteredDate,
      openingBalanceResult ? openingBalanceResult.openingBalance : 0,
      totalInvoicesAmount,
      credInvoicesTotal,
      grossTotal,
      salesBooksAndInvoices,
      credInvoices
    );

    doc.end();
  } catch (error) {
    console.log(error);
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(ApiResponse.error(bad_request_code, error.message));
  }
};
