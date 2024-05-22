import { INVOICE_TYPES } from "../constants/invoiceTypes.js";
import { fDate, formatCurrency } from "./commonServices.js";

// Function to create PDF
export const generateInvoiceSummaryPDF = (
  doc,
  filteredDate,
  openingBalance,
  salesBookBalance,
  paymentsBalance,
  grossTotal,
  salesBooksAndInvoices,
  credInvoices
) => {
  let y = 150;

  const incrementYAndCheck = () => {
    y += 30;
    if (y >= 750) {
      doc.addPage();
      y = 40; // Reset y for the new page
    }
    return y;
  };

  // Logo and company information
  doc
    .font("Helvetica-Bold")
    .fontSize(24)
    .text("GAMAGE HARDWARE (PVT) LTD", 40, 30, { align: "left" });
  doc
    .font("Helvetica")
    .fontSize(10)
    .text("Reg.No. - PV00204604", 40, 55, { align: "left" });
  doc
    .font("Helvetica")
    .fontSize(12)
    .text("077 373 3399", 40, 70, { align: "left" })
    .text("gamagehardwaredeniyaya@gmail.com", 40, 85, {
      align: "left",
    })
    .text("No.150, Hospital Road, Deniyaya", 40, 100, {
      align: "left",
    });

  // Divider
  doc.moveTo(40, 130).lineTo(550, 130).stroke();

  // Summary
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("Date", 40, y, { align: "left" });
  doc
    .font("Helvetica")
    .fontSize(10)
    .text(fDate(filteredDate), 200, y, { align: "left" });

  incrementYAndCheck();

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("Opening Balance", 40, y, { align: "left" });
  doc
    .font("Helvetica")
    .fontSize(10)
    .text(formatCurrency(openingBalance), 200, y, { align: "left" });

  incrementYAndCheck();

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("Total SalesBooks Balance", 40, y, { align: "left" });
  doc
    .font("Helvetica")
    .fontSize(10)
    .text(formatCurrency(salesBookBalance), 200, y, { align: "left" });

  incrementYAndCheck();

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("Total Creditors Payments", 40, y, { align: "left" });
  doc
    .font("Helvetica")
    .fontSize(10)
    .text(formatCurrency(paymentsBalance), 200, y, { align: "left" });

  incrementYAndCheck();

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("Gross Total", 40, y, { align: "left" });
  doc
    .font("Helvetica")
    .fontSize(10)
    .text(formatCurrency(grossTotal), 200, y, { align: "left" });

  incrementYAndCheck();

  // Divider
  doc.moveTo(40, y).lineTo(550, y).stroke();

  incrementYAndCheck();

  // Range Invoices
  salesBooksAndInvoices.map((book) => {
    if (book.bookType === INVOICE_TYPES.RANGE) {
      doc.font("Helvetica-Bold").fontSize(12).text(book.bookName, 40, y);

      incrementYAndCheck();

      // Divider
      doc.moveTo(40, y).lineTo(550, y).stroke();

      y += 10;

      // Table headers
      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .text("From", 40, y)
        .text("To", 100, y)
        .text("Description", 150, y)
        .text("Amount In", 350, y)
        .text("Amount out", 470, y);

      y += 20;

      // Divider
      doc.moveTo(40, y).lineTo(550, y).stroke();

      incrementYAndCheck();

      // Table Data
      if (book.rangeinvoices.length > 0) {
        book.rangeinvoices.map((invoice) => {
          doc
            .font("Helvetica")
            .fontSize(10)
            .text(invoice.invoiceNoFrom, 40, y)
            .text(invoice.invoiceNoTo, 100, y)
            .text(
              invoice.invoiceDescription ? invoice.invoiceDescription : " - ",
              150,
              y
            )
            .text(formatCurrency(invoice.invoiceAmount), 470, y);

          incrementYAndCheck();
        });
      } else {
        doc.font("Helvetica").fontSize(10).text("Invoices not found ", 250, y);
        incrementYAndCheck();
      }
    }
  });

  // Range Invoices
  salesBooksAndInvoices.map((book) => {
    if (book.bookType === INVOICE_TYPES.SINGLE) {
      doc.font("Helvetica-Bold").fontSize(12).text(book.bookName, 40, y);

      incrementYAndCheck();

      // Divider
      doc.moveTo(40, y).lineTo(550, y).stroke();

      y += 10;

      // Table headers
      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .text("Invoice No", 40, y)
        .text("Description", 150, y)
        .text("Amount In", 350, y)
        .text("Amount out", 470, y);

      y += 20;
      // Divider
      doc.moveTo(40, y).lineTo(550, y).stroke();

      incrementYAndCheck();

      // Table Data
      if (book.singleinvoices.length > 0) {
        book.singleinvoices.map((invoice) => {
          doc
            .font("Helvetica")
            .fontSize(10)
            .text(invoice.invoiceNo, 40, y)
            .text(
              invoice.invoiceDescription ? invoice.invoiceDescription : " - ",
              150,
              y
            )
            .text(formatCurrency(invoice.invoiceAmount), 470, y);

          incrementYAndCheck();
        });
      } else {
        doc.font("Helvetica").fontSize(10).text("Invoices not found ", 250, y);
        incrementYAndCheck();
      }
    }
  });

  doc.font("Helvetica-Bold").fontSize(12).text("Creditor Payments", 40, y);

  incrementYAndCheck();

  // Divider
  doc.moveTo(40, y).lineTo(550, y).stroke();

  y += 10;

  // Table headers
  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .text("Invoice No", 40, y)
    .text("Creditor", 100, y)
    .text("City", 250, y)
    .text("Amount", 450, y);

  y += 20;
  // Divider
  doc.moveTo(40, y).lineTo(550, y).stroke();

  incrementYAndCheck();

  // Table Data
  if (credInvoices.length > 0) {
    credInvoices.map((invoice) => {
      doc
        .font("Helvetica")
        .fontSize(10)
        .text(invoice.invoiceNo, 40, y)
        .text(invoice.invoiceCreditorRef.creditorName, 100, y)
        .text(invoice.invoiceCreditorRef.creditorCity, 250, y)
        .text(formatCurrency(invoice.invoiceAmount), 450, y);

      incrementYAndCheck();
    });
  } else {
    doc.font("Helvetica").fontSize(10).text("Invoices not found ", 250, y);
    incrementYAndCheck();
  }

  // Return the stream
  return doc;
};
