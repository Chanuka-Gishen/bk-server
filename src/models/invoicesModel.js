import mongoose from "mongoose";

const Schema = mongoose.Schema;

const invoiceSchema = new Schema({
  invoiceNoFrom: {
    type: Number,
    required: true,
  },
  invoiceNoTo: {
    type: Number,
    required: true,
  },
  invoiceCreatedAt: {
    type: Date,
    required: true,
  },
  invoiceAmount: {
    type: Number,
    required: true,
  },
  invoiceSalesBookRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SalesBook",
    required: true,
  },
});

const InvoiceModel = mongoose.model("Invoices", invoiceSchema);

export default InvoiceModel;
