import httpStatus from "http-status";
import { ObjectId } from "mongodb";

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
