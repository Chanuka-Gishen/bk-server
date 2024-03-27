import mongoose from "mongoose";

const Schema = mongoose.Schema;

const creditorSchema = new Schema({
  creditorName: { type: String, required: true },
  creditorCity: { type: String, required: true },
  creditorMobilePrimary: { type: String, required: true },
  creditorMobileSecondary: { type: String },
  creditorCreditPeriod: { type: Number, required: true },
  creditorUserName: { type: String, required: true },
  creditorOrganization: { type: String },
  creditorCreatedAt: { type: Date, default: new Date() },
});

const CreditorModel = mongoose.model("Creditor", creditorSchema);

export default CreditorModel;
