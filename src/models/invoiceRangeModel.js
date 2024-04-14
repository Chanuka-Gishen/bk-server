import mongoose from "mongoose";

const Schema = mongoose.Schema;

// Multiple invoices entry
const invoiceRangeSchema = new Schema({
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

const InvoiceRangeModel = mongoose.model("RangeInvoices", invoiceRangeSchema);

export default InvoiceRangeModel;
