import mongoose from "mongoose";

const Schema = mongoose.Schema;

const paymentSchema = new Schema({
  paymentDescription: {
    type: String,
    required: true,
  },
  paymentAmount: {
    type: Number,
    required: true,
  },
  paymentDate: {
    type: Date,
    required: true,
    default: new Date(),
  },
});

const PaymentModel = mongoose.model("Payments", paymentSchema);

export default PaymentModel;
