import mongoose from "mongoose";

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
  bookCreatedDate: {
    type: Date,
    default: Date.now(),
  },
});

const SalesBookModel = mongoose.model("SalesBook", salesBookSchema);

export default SalesBookModel;
