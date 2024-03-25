import mongoose from "mongoose";

const Schema = mongoose.Schema;

const sequenceSchema = new Schema({
  sequenceCode: {
    type: String,
    required: true,
    unique: true,
  },
  sequenceValue: {
    type: Number,
    default: 0,
  },
});

const SequenceModel = mongoose.model("Sequence", sequenceSchema);

export default SequenceModel;
