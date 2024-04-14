import mongoose from "mongoose";

const Schema = mongoose.Schema;

// Creditor invoice entry
const invoiceCreditorSchema = new Schema({
  invoiceNo: {
    type: Number,
    required: true,
  },
  invoiceCreditorRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Creditor",
    required: true,
  },
  invoiceCreditorInvoiceRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CredInvoice",
    required: true,
  },
  invoiceAmount: {
    type: Number,
    required: true,
  },
  invoiceCreatedAt: {
    type: Date,
    required: true,
  },
});

const InvoiceCreditorModel = mongoose.model(
  "CreditorInvoices",
  invoiceCreditorSchema
);

export default InvoiceCreditorModel;
