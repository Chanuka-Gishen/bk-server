import httpStatus from "http-status";
import { ObjectId } from "mongodb";

import ApiResponse from "../services/ApiResponse.js";
import {
  bad_request_code,
  openingBalance_error_code,
  openingBalance_success_code,
} from "../constants/statusCodes.js";
import CashBalanceModel from "../models/cashBalanceModel.js";
import InvoiceRangeModel from "../models/invoiceRangeModel.js";
import InvoiceSingleModel from "../models/invoiceSingleModel.js";
import InvoiceCreditorModel from "../models/invoiceCreditorModel.js";
import {
  cash_balance_exists,
  cash_balance_not_found,
  cash_balance_reset,
  cash_balance_updated,
  success_message,
} from "../constants/messageConstants.js";
import { cashBalanceUpdateSchema } from "../schemas/cashBalance/cashBalanceUpdateSchema.js";
import { cashBalanceAddSchema } from "../schemas/cashBalance/cashBalanceAddSchema.js";

// Add cash balance manually
export const addCashBalanceController = async (req, res) => {
  try {
    const { error, value } = cashBalanceAddSchema.validate(req.body);

    if (error) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(ApiResponse.error(bad_request_code, error.message));
    }

    const { cashBalanceDate, openingBalance } = value;

    const today = new Date(cashBalanceDate);
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0); // Set start of the day

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999); // Set end of the day

    const cashBalance = await CashBalanceModel.findOne({
      cashBalanceDate: { $gte: startOfDay, $lte: endOfDay },
    });

    if (cashBalance) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(
          ApiResponse.error(openingBalance_error_code, cash_balance_exists)
        );
    }

    const newOpeningBalance = new CashBalanceModel({
      cashBalanceDate: today,
      openingBalance: openingBalance,
    });

    await newOpeningBalance.save();

    return res
      .status(httpStatus.CREATED)
      .json(ApiResponse.response(openingBalance_success_code, success_message));
  } catch (error) {
    console.log(error);
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(ApiResponse.error(bad_request_code, error.message));
  }
};

// Update today opening cash balance
export const updateOpeningBalanceController = async (req, res) => {
  try {
    const { error, value } = cashBalanceUpdateSchema.validate(req.body);

    if (error) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(ApiResponse.error(bad_request_code, error.message));
    }

    const { id, openingBalance } = value;

    const result = await CashBalanceModel.findById(new ObjectId(id));

    if (!result) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(
          ApiResponse.error(openingBalance_error_code, cash_balance_not_found)
        );
    }

    result.openingBalance = openingBalance;

    await result.save();

    return res
      .status(httpStatus.OK)
      .json(
        ApiResponse.response(openingBalance_success_code, cash_balance_updated)
      );
  } catch (error) {
    console.log(error);
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(ApiResponse.error(bad_request_code, error.message));
  }
};

// Get cash opening balance - 7 days
export const GetOpeningBalance = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0); // Set start of the day

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999); // Set end of the day

    const cashBalance = await CashBalanceModel.findOne({
      cashBalanceDate: { $gte: startOfDay, $lte: endOfDay },
    });

    if (!cashBalance) {
      const today = new Date();

      const totalNetAmount = await calculateNetAmount(
        new Date(today.setDate(today.getDate() - 1))
      );

      const openingBalance = new CashBalanceModel({
        cashBalanceDate: new Date(),
        openingBalance: totalNetAmount,
      });

      await openingBalance.save();
    }

    const result = await CashBalanceModel.find()
      .sort({ cashBalanceDate: -1 })
      .limit(7);

    return res
      .status(httpStatus.OK)
      .json(
        ApiResponse.response(
          openingBalance_success_code,
          success_message,
          result
        )
      );
  } catch (error) {
    console.log(error);
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(ApiResponse.error(bad_request_code, error.message));
  }
};

// Get today opening cash balance
export const getTodayOpeningCashBalanceController = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0); // Set start of the day

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999); // Set end of the day

    const cashBalance = await CashBalanceModel.findOne({
      cashBalanceDate: { $gte: startOfDay, $lte: endOfDay },
    });

    if (cashBalance) {
      return res
        .status(httpStatus.OK)
        .json(
          ApiResponse.response(
            openingBalance_success_code,
            success_message,
            cashBalance
          )
        );
    }

    const totalNetAmount = await calculateNetAmount(
      new Date(today.setDate(today.getDate() - 1))
    );

    const openingBalance = new CashBalanceModel({
      cashBalanceDate: new Date(),
      openingBalance: totalNetAmount,
    });

    const savedBalance = await openingBalance.save();

    return res
      .status(httpStatus.OK)
      .json(
        ApiResponse.response(
          openingBalance_success_code,
          success_message,
          savedBalance
        )
      );
  } catch (error) {
    console.log(error);
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(ApiResponse.error(bad_request_code, error.message));
  }
};

export const resetOpeningCashBalanceController = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await CashBalanceModel.findById(new ObjectId(id));

    if (!record) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(
          ApiResponse.error(openingBalance_error_code, cash_balance_not_found)
        );
    }

    const date = new Date(record.cashBalanceDate);
    const dayBefore = new Date(date.setDate(date.getDate() - 1));

    const startOfDay = new Date(dayBefore);
    startOfDay.setHours(0, 0, 0, 0); // Set start of the day

    const endOfDay = new Date(dayBefore);
    endOfDay.setHours(23, 59, 59, 999); // Set end of the day

    const openingBalance = await CashBalanceModel.findOne({
      cashBalanceDate: { $gte: startOfDay, $lte: endOfDay },
    });

    const netAmount = await calculateNetAmount(dayBefore);

    const balance = openingBalance ? openingBalance.openingBalance : 0;

    record.openingBalance = netAmount + balance;

    await record.save();

    return res
      .status(httpStatus.OK)
      .json(
        ApiResponse.response(openingBalance_success_code, cash_balance_reset)
      );
  } catch (error) {
    console.log(error);
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(ApiResponse.error(bad_request_code, error.message));
  }
};

// Function to calculate total net amount for a given date
export const calculateNetAmount = async (date) => {
  const pipeline = [
    {
      $match: {
        invoiceCreatedAt: {
          $gte: new Date(date.setHours(0, 0, 0, 0)), // Start of the day
          $lte: new Date(date.setHours(23, 59, 59, 999)), // End of the day
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
  ];

  const paymentPipeline = [
    {
      $match: {
        invoiceCreatedAt: {
          $gte: new Date(date.setHours(0, 0, 0, 0)), // Start of the day
          $lte: new Date(date.setHours(23, 59, 59, 999)), // End of the day
        },
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$invoiceAmount" },
      },
    },
  ];

  const rangeResult = await InvoiceRangeModel.aggregate(pipeline);
  const singleResult = await InvoiceSingleModel.aggregate(pipeline);
  const paymentResult = await InvoiceCreditorModel.aggregate(paymentPipeline);

  const totalInAmount =
    (rangeResult[0]?.totalInAmount || 0) +
    (singleResult[0]?.totalInAmount || 0);
  const totalOutAmount =
    (rangeResult[0]?.totalOutAmount || 0) +
    (singleResult[0]?.totalOutAmount || 0);
  const totalPayments = paymentResult[0]?.totalAmount || 0;

  return totalInAmount - totalOutAmount + totalPayments;
};
