import httpStatus from "http-status";
import { ObjectId } from "mongodb";

import ApiResponse from "../services/ApiResponse.js";
import {
  bad_request_code,
  salesBook_success_code,
} from "../constants/statusCodes.js";
import { salesBookAddSchema } from "../schemas/salesBookAddSchema.js";
import SalesBookModel from "../models/salesBooksModel.js";
import { book_exists, success_message } from "../constants/messageConstants.js";
import { createSequence } from "./sequenceController.js";

// Create new sales book
export const createSalesBookController = async (req, res) => {
  try {
    const { error, value } = salesBookAddSchema.validate(req.body);

    if (error) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(ApiResponse.error(bad_request_code, error.message));
    }

    const { bookName } = value;

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
