import mongoose from "mongoose";

const Schema = mongoose.Schema;

// Single invoice entry
const invoiceSingleSchema = new Schema({
  invoiceNo: {
    type: Number,
    required: true,
  },
  invoiceDesciption: {
    type: String,
    default: null,
  },
  invoiceCreatedAt: {
    type: Date,
    required: true,
  },
  invoiceSalesBookRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SalesBook",
    required: true,
  },
  invoiceInAmount: {
    type: Number,
    required: true,
  },
  invoiceOutAmount: {
    type: Number,
    required: true,
  },
});

const InvoiceSingleModel = mongoose.model(
  "SingleInvoices",
  invoiceSingleSchema
);

export default InvoiceSingleModel;
