import { format } from 'date-fns';

export const createRandomPassword = () => {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const length = 8;
  let randomString = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    randomString += charset.charAt(randomIndex);
  }

  return randomString;
};

export const excelSerialDateToJSDate = (serialDate) => {
  const MS_PER_DAY = 24 * 60 * 60 * 1000; // Number of milliseconds in a day
  const EPOCH_OFFSET = 25569; // Excel epoch offset (January 1, 1970)

  // Convert Excel serial date to milliseconds since Unix epoch
  const millisecondsSinceEpoch = (serialDate - EPOCH_OFFSET) * MS_PER_DAY;

  // Create and return a new Date object from the milliseconds
  return new Date(millisecondsSinceEpoch);
};

export const formatCurrency = (amount) => {
  const formattedAmount = amount
    .toLocaleString("en-IN", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 2,
    })
    .replace("LKR", "Rs.");
  return formattedAmount;
};

export const fDate = (date, newFormat) => {
  const fm = newFormat || "dd MMM yyyy";

  return date ? format(new Date(date), fm) : "-";
};
