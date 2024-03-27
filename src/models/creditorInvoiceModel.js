import mongoose from "mongoose";
import { PAYMENT_STATUS } from "../constants/paymentStatus.js";

const Schema = mongoose.Schema;

const credInvoiceSchema = new Schema({
  credInvoiceNo: {
    type: String,
    required: true,
  },
  credInvoicedCreditor: {
    type: mongoose.Types.ObjectId,
    ref: "Creditor",
    required: true,
  },
  credInvoiceStatus: {
    type: String,
    enum: [PAYMENT_STATUS.PAID, PAYMENT_STATUS.NOTPAID],
    default: PAYMENT_STATUS.NOTPAID,
    required: true,
  },
  credInvoiceAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  credInvoiceDueDate: {
    type: Date,
    required: true,
  },
  credInvoiceDate: {
    type: Date,
    required: true,
    default: new Date(),
  },
  credInvoicePaidDate: {
    type: Date,
    default: null,
  },
});

const CredInvoiceModel = mongoose.model("CredInvoice", credInvoiceSchema);

export default CredInvoiceModel;
