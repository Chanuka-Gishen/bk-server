import mongoose from "mongoose";

const Schema = mongoose.Schema;

const cashBalanceSchema = new Schema({
  cashBalanceDate: {
    type: Date,
    required: true,
    unique: true,
  },
  openingBalance: {
    type: Number,
    required: true,
  },
});

const CashBalanceModel = mongoose.model("CashBalance", cashBalanceSchema);

export default CashBalanceModel;
