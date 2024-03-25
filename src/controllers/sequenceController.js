import { ObjectId } from "mongodb";

import SequenceModel from "../models/sequenceModel.js";

// Create new sequence
export const createSequence = async (title) => {
  const sequenceCode = `${title.replace(/\s+/g, "").toLowerCase()}_sequence`;

  const existingSequence = await SequenceModel.findOne({ sequenceCode });

  if (existingSequence) {
    return;
  }

  const sequence = await SequenceModel({
    sequenceCode,
  });

  return await sequence.save();
};

// Get sequence value
export const getSequenceValue = async (id) => {
  const value = await SequenceModel.findById(new ObjectId(id));

  if (value) {
    return value.sequenceValue;
  }

  return;
};

// Update sequence value
export const updateSequenceValue = async (id) => {
  const sequence = await SequenceModel.findById(new ObjectId(id));

  if (!sequence) {
    return;
  }

  sequence.sequenceValue += 1;

  return await sequence.save();
};
