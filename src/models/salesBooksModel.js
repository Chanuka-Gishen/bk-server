import mongoose from "mongoose";
import { INVOICE_TYPES } from "../constants/invoiceTypes.js";

const Schema = mongoose.Schema;

const salesBookSchema = new Schema({
  bookName: {
    type: String,
    required: true,
    unique: true,
  },
  bookSequence: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Sequence",
    required: true,
  },
  bookType: {
    type: String,
    required: true,
    enum: [INVOICE_TYPES.RANGE, INVOICE_TYPES.SINGLE, INVOICE_TYPES.CREDITOR],
  },
  bookCreatedDate: {
    type: Date,
    default: Date.now(),
  },
});

const SalesBookModel = mongoose.model("SalesBook", salesBookSchema);

export default SalesBookModel;
