import { db } from "@/lib/db";
import {
  Contact,
  Invoice,
  Quotation,
  QuotationList,
  User,
} from "@prisma/client";
import { PDFDocument, PDFEmbeddedPage, PDFFont, PDFPage } from "pdf-lib";
import {
  getBoundingBox,
  PDFDateFormat,
  loadPdfAssets,
  validatePageArea,
  getTextWidth,
  getPaymentCondition,
  getBillDueDate,
  convertToThaiBahtText,
  getCustomerNameWithBranch,
  formatInstallmentText,
} from "./pdf.helpers";
import path from "path";
import { QuotationInstallmentWithRelations } from "@/types";

type QuotationWithRelations = Quotation & {
  lists?: QuotationList[];
  contact?: Contact | null;
  seller?: User | null;
  invoices?: Invoice[]; // Changed from invoice to invoices array
  installmentData?: {
    period: string;
    amount: number;
    amountWithVat: number;
    dueDate: Date;
    status: string;
  };
};
// type PurchaseOrderWithRelations = PurchaseOrder & {
//   quotation?: QuotationWithRelations | null;
// };

let _BILL_DATE = "";
let _BILL_CODE = "";
let _DATA: QuotationWithRelations | null = null;
let _FONT: PDFFont | null = null;
let _INSTALLMENT_DATA: QuotationInstallmentWithRelations | null = null;

// item list config
const PAGE_FONT_SIZE = 8;
const LIST_END_AT = 210;
const ITEM_Y_Start = 595;
const ITEM_X_Start = 65;

// horizontal position
const columnPosition = {
  index: ITEM_X_Start - 10,
  description: ITEM_X_Start + 30,
  quantity: ITEM_X_Start + 349,
  unit: ITEM_X_Start + 390,
  unitPrice: ITEM_X_Start + 385,
  amount: ITEM_X_Start + 465,
};

const CURRENCY_FORMAT = {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
};

const getData = async (
  id: number,
  defaultDate: string,
  installmentId?: number
): Promise<QuotationWithRelations | null> => {
  const quotation = await db.quotation.findUnique({
    include: {
      lists: {
        where: {
          hiddenInPdf: false, // only include items that are not hidden in PDF
        },
        orderBy: {
          order: "asc", // order by the order field
        },
        // take: 15, // limit to 100 items
      },
      contact: true,
      seller: true,
      invoices: true, // Changed from invoice to invoices
    },
    where: {
      id: parseInt(id.toString()),
    },
  });

  const quotationInvoice = quotation?.invoices?.[0] || null;
  _BILL_DATE = PDFDateFormat(new Date(quotationInvoice?.date ?? defaultDate));
  _BILL_CODE = quotationInvoice?.code || "";

  // If installment ID is provided, fetch installment data
  if (installmentId && quotation) {
    const installment = await db.quotationInstallment.findUnique({
      where: { id: installmentId },
      include: {
        invoice: true,
      },
    });

    if (installment) {
      _INSTALLMENT_DATA = installment;

      if (installment.invoice?.date) {
        _BILL_DATE = PDFDateFormat(new Date(installment.invoice?.date));
      }

      if (installment.invoice?.code) {
        _BILL_CODE = installment.invoice?.code;
      }
    }
  }

  return quotation;
};

export const generateInvoice = async (
  id: number,
  defaultDate: string,
  installmentId?: number
) => {
  try {
    if (!id) {
      throw new Error("Invalid quotation ID");
    }

    // Reset installment data
    _INSTALLMENT_DATA = null;

    const quotation = await getData(id, defaultDate, installmentId);

    if (!quotation) {
      throw new Error("PurchaseOrder not found");
    }

    _DATA = quotation;
    return main();
  } catch (error) {
    console.log(error);
    throw new Error("Error writing PDF file");
  }
};

const main = async () => {
  if (!_DATA) return;
  // list start position

  const totalPages = 4;
  const { pdfDoc, font, template } = await loadPdfAssets(
    "pdf/product-bill-to-customer-template.pdf"
  );
  _FONT = font;

  const config = {
    size: PAGE_FONT_SIZE,
    lineHeight: 11,
    font: _FONT,
  };

  // loop through all pages
  let currentPageNumber = 1; // Track page number across all templates
  for (let i = 0; i < totalPages; i++) {
    const templatePage = await pdfDoc.embedPage(template.getPages()[i]);
    let page = pdfDoc.addPage();
    page.drawPage(templatePage);

    drawStaticInfo(page, currentPageNumber);

    const result = drawItemLists(page, pdfDoc, templatePage, config, currentPageNumber);
    // Update page reference and page number in case new pages were added
    if (result) {
      page = result.page;
      currentPageNumber = result.pageNumber + 1; // Continue from the last page number + 1
    } else {
      currentPageNumber++; // Increment if no overflow occurred
    }
  }

  const modifiedPdfBytes = await pdfDoc.save();
  return {
    pdfBytes: modifiedPdfBytes,
  };
};

const drawItemLists = (
  page: PDFPage,
  pdfDoc: PDFDocument,
  templatePage: PDFEmbeddedPage,
  config: {
    font: PDFFont;
    size: number;
    lineHeight: number;
  },
  currentPageNumber: number
) => {
  if (!_DATA || !_FONT) return { page, pageNumber: currentPageNumber };

  let lineStart = ITEM_Y_Start;
  let pageNumber = currentPageNumber;

  // write item list
  _DATA?.lists?.forEach((list, index) => {
    if (index > 0) {
      lineStart -= config.lineHeight; // space between main items
    }

    const previousPage = page;
    const mainItemRes = validatePageArea(
      page,
      pdfDoc,
      templatePage,
      lineStart,
      LIST_END_AT,
      ITEM_Y_Start,
      (currentPage: PDFPage, currentLineStart: number) =>
        writeMainItem(
          currentPage,
          index,
          list,
          currentLineStart,
          config,
          pdfDoc
        )
    );
    lineStart = mainItemRes.lineStart;
    page = mainItemRes.page;

    // Check if a new page was created
    if (page !== previousPage) {
      pageNumber++;
      drawStaticInfo(page, pageNumber);
    }

    if (list.description) {
      const previousPageDesc = page;
      const mainDescriptionRes = validatePageArea(
        page,
        pdfDoc,
        templatePage,
        lineStart,
        LIST_END_AT,
        ITEM_Y_Start,
        (currentPage: PDFPage, currentLineStart: number) =>
          writeMainDescription(
            currentPage,
            list.description ?? "",
            currentLineStart,
            config,
            pdfDoc
          )
      );

      lineStart = mainDescriptionRes.lineStart;
      page = mainDescriptionRes.page;

      // Check if a new page was created
      if (page !== previousPageDesc) {
        pageNumber++;
        drawStaticInfo(page, pageNumber);
      }
    }
  });

  // Add discount row if there's any discount in the lists
  const totalDiscount = _DATA?.lists?.reduce((sum, list) => sum + (list.discount ?? 0), 0) ?? 0;
  if (totalDiscount > 0 && !_INSTALLMENT_DATA) {
    lineStart -= config.lineHeight; // space before discount row
    const listCount = _DATA?.lists?.length ?? 0;

    const previousPageDiscount = page;
    const discountRes = validatePageArea(
      page,
      pdfDoc,
      templatePage,
      lineStart,
      LIST_END_AT,
      ITEM_Y_Start,
      (currentPage: PDFPage, currentLineStart: number) =>
        writeDiscountRow(currentPage, listCount, totalDiscount, currentLineStart, config)
    );

    lineStart = discountRes.lineStart;
    page = discountRes.page;

    // Check if a new page was created
    if (page !== previousPageDiscount) {
      pageNumber++;
      drawStaticInfo(page, pageNumber);
    }
  }

  // Add installment_period_info at the end of all item lists
  if (_INSTALLMENT_DATA) {
    lineStart -= config.lineHeight; // Add spacing before installment info

    const previousPageInstallment = page;
    const installmentRes = validatePageArea(
      page,
      pdfDoc,
      templatePage,
      lineStart,
      LIST_END_AT,
      ITEM_Y_Start,
      (currentPage: PDFPage, currentLineStart: number) =>
        writeInstallmentInfo(
          currentPage,
          currentLineStart,
          config,
          pdfDoc
        )
    );

    lineStart = installmentRes.lineStart;
    page = installmentRes.page;

    // Check if a new page was created
    if (page !== previousPageInstallment) {
      pageNumber++;
      drawStaticInfo(page, pageNumber);
    }
  }

  return { page, pageNumber };
};

const writeMainItem = (
  currentPage: PDFPage,
  index: number,
  data: QuotationList,
  lineStart: number,
  config: {
    font: PDFFont;
    size: number;
    lineHeight: number;
  },
  pdfDoc: PDFDocument
) => {
  currentPage.drawText((index + 1).toString(), {
    x: columnPosition.index,
    y: lineStart,
    maxWidth: 20,
    ...config,
  });

  const itemName = `${!!data.allowedWithholdingTax ? "(**)" : ""} ${data.name}`;

  currentPage.drawText(itemName, {
    x: columnPosition.description,
    y: lineStart,
    maxWidth: 300,
    ...config,
  });

  // Use installment amount if available, otherwise use quotation list data
  let unitPrice, amount;
  if (_INSTALLMENT_DATA) {
    // For installments: use installment amount for both unitPrice and amount
    unitPrice = _INSTALLMENT_DATA.amount;
    amount = _INSTALLMENT_DATA.amount;
  } else {
    // For regular quotations: use original data, deduct discount from price only
    const itemDiscount = 0 //data.discount ?? 0;
    unitPrice = data.unitPrice ?? 0;
    amount = (data.price ?? 0) - itemDiscount;
  }

  // Show price only if showPrice is true for installment or if it's not an installment
  const shouldShowPrice = _INSTALLMENT_DATA?.showPrice || !_INSTALLMENT_DATA;

  if (shouldShowPrice) {
    // Quantity
    currentPage.drawText(data.quantity ? data.quantity.toString() : "", {
      x: columnPosition.quantity,
      y: lineStart,
      maxWidth: 20,
      ...config,
    });

    const unitPriceText = unitPrice.toLocaleString("th-TH", CURRENCY_FORMAT);

    currentPage.drawText(unitPriceText, {
      x: columnPosition.unitPrice + 44 - getTextWidth(unitPriceText, config),
      y: lineStart,
      maxWidth: 20,
      ...config,
    });

    const amountText = amount.toLocaleString("th-TH", CURRENCY_FORMAT);

    currentPage.drawText(amountText, {
      x: columnPosition.amount + 44 - getTextWidth(amountText, config),
      y: lineStart,
      maxWidth: 50,
      ...config,
    });
  }

  const bounding = getBoundingBox(
    data.name,
    pdfDoc,
    _FONT,
    PAGE_FONT_SIZE,
    config.lineHeight + 4,
    300
  );

  return bounding.height / 10;
};

const writeDiscountRow = (
  currentPage: PDFPage,
  lastIndex: number,
  totalDiscount: number,
  lineStart: number,
  config: {
    font: PDFFont;
    size: number;
    lineHeight: number;
  }
) => {
  // Index = last index + 1
  currentPage.drawText((lastIndex + 1).toString(), {
    x: columnPosition.index,
    y: lineStart,
    maxWidth: 20,
    ...config,
  });

  // Item name = "ส่วนลด"
  currentPage.drawText("ส่วนลด", {
    x: columnPosition.description,
    y: lineStart,
    maxWidth: 300,
    ...config,
  });

  // Quantity = 1
  currentPage.drawText("1", {
    x: columnPosition.quantity,
    y: lineStart,
    maxWidth: 20,
    ...config,
  });

  // Unit price and amount = negative total discount
  const discountText = `${totalDiscount.toLocaleString("th-TH", CURRENCY_FORMAT)}`;

  currentPage.drawText(discountText, {
    x: columnPosition.unitPrice + 44 - getTextWidth(discountText, config),
    y: lineStart,
    maxWidth: 50,
    ...config,
  });

  currentPage.drawText(discountText, {
    x: columnPosition.amount + 44 - getTextWidth(discountText, config),
    y: lineStart,
    maxWidth: 50,
    ...config,
  });

  return config.lineHeight;
};

const writeMainDescription = (
  currentPage: PDFPage,
  description: string,
  lineStart: number,
  config: {
    font: PDFFont;
    size: number;
    lineHeight: number;
  },
  pdfDoc: PDFDocument
) => {
  let currentY = lineStart;
  let totalHeight = 0;

  // Draw the original description
  currentPage.drawText(description ?? "", {
    x: columnPosition.description + 12, // indent
    y: currentY,
    maxWidth: 300,
    ...config,
    opacity: 0.5,
  });

  const descriptionBounding = getBoundingBox(
    description,
    pdfDoc,
    _FONT,
    PAGE_FONT_SIZE,
    config.lineHeight + 4,
    300
  );
  totalHeight += descriptionBounding.height / 10;

  return totalHeight;
};

const writeInstallmentInfo = (
  currentPage: PDFPage,
  lineStart: number,
  config: {
    font: PDFFont;
    size: number;
    lineHeight: number;
  },
  pdfDoc: PDFDocument
) => {
  if (!_INSTALLMENT_DATA) return 0;

  const installmentText = formatInstallmentText(
    _INSTALLMENT_DATA,
    _DATA?.installmentContractNumber
  );

  currentPage.drawText(installmentText, {
    x: columnPosition.description + 12, // indent same as description
    y: lineStart,
    maxWidth: 300,
    ...config,
    opacity: 0.7,
  });

  const installmentBounding = getBoundingBox(
    installmentText,
    pdfDoc,
    _FONT,
    PAGE_FONT_SIZE,
    config.lineHeight + 4,
    300
  );

  return installmentBounding.height / 10;
};

const drawHeaderInfo = (page: PDFPage, pageNumber: number) => {
  if (!_FONT) return;
  const X_Start = 480;
  const Y_Start = 790;
  const config = {
    font: _FONT,
    size: PAGE_FONT_SIZE,
    lineHeight: 16,
  };

  page.drawText(pageNumber.toString(), {
    x: 530,
    y: 790,
    maxWidth: 100,
    ...config,
  });
};

const drawCustomerInfo = (page: PDFPage) => {
  if (!_DATA || !_FONT) return;
  const config = {
    font: _FONT,
    size: PAGE_FONT_SIZE,
    lineHeight: 14,
  };

  const customer = {
    ..._DATA?.contact,
    name: _DATA?.contact?.name ?? "",
    branchId: _DATA?.contact?.branchId ?? "",
    contact: _DATA?.overrideContactName ?? _DATA?.contact?.contact,
    email: _DATA?.overrideContactEmail ?? _DATA?.contact?.email,
    phone: _DATA?.overrideContactPhone ?? _DATA?.contact?.phone,
  };

  if (!customer) {
    return;
  }

  const Y_Start = 702;
  const X_Start = 85;
  page.drawText(customer.branchId ?? "", {
    x: X_Start,
    y: Y_Start,
    maxWidth: 600,
    ...config,
  });

  page.drawText(getCustomerNameWithBranch(customer.name, customer.branchId), {
    x: X_Start,
    y: Y_Start - config.lineHeight,
    maxWidth: 500,
    ...config,
  });

  page.drawText(customer.address ?? "", {
    x: X_Start,
    y: Y_Start - config.lineHeight * 2,
    maxWidth: 500,
    ...config,
  });

  // combine taxId, branchId
  // const taxInfo = [
  //   customer.taxId,
  //   customer.branchId ? `สาขาที่ ${customer.branchId}` : "",
  // ]
  //   .filter((item) => item)
  //   .join(", ");

  page.drawText(customer.taxId ?? "", {
    x: X_Start,
    y: Y_Start - config.lineHeight * 4,
    maxWidth: 500,
    ...config,
  });

  // combine contact, phone, fax, email
  const contactInfo = [
    customer.contact,
    customer.phone,
    customer.fax,
    // customer.email,
  ]
    .filter((item) => item)
    .join(", ");

  page.drawText(contactInfo, {
    x: X_Start,
    y: Y_Start - config.lineHeight * 5,
    maxWidth: 500,
    ...config,
  });

  // right side
  const quotation = _DATA;

  const rightXStart = 500;
  // code
  page.drawText(_BILL_CODE, {
    x: rightXStart,
    y: Y_Start,
    maxWidth: 100,
    ...config,
  });

  // date
  page.drawText(_BILL_DATE, {
    x: rightXStart,
    y: Y_Start - config.lineHeight,
    maxWidth: 100,
    ...config,
  });

  const seller = quotation?.seller;
  page.drawText(seller?.name ?? "", {
    x: rightXStart,
    y: Y_Start - config.lineHeight * 2,
    maxWidth: 100,
    ...config,
  });

  page.drawText(quotation?.purchaseOrderRef ?? "", {
    x: rightXStart,
    y: Y_Start - config.lineHeight * 5,
    maxWidth: 100,
    ...config,
  });

  const paymentCondition = getPaymentCondition(
    quotation?.paymentCondition ?? ""
  );
  page.drawText(paymentCondition, {
    x: rightXStart,
    y: Y_Start - config.lineHeight * 3,
    maxWidth: 100,
    ...config,
  });

  const dueDate = getBillDueDate(
    new Date(_BILL_DATE),
    quotation?.paymentCondition ?? ""
  );
  page.drawText(PDFDateFormat(dueDate), {
    x: rightXStart,
    y: Y_Start - config.lineHeight * 4,
    maxWidth: 100,
    ...config,
  });
};

const drawPriceInfo = (
  page: PDFPage,
  {
    totalPrice,
    discount,
    tax,
    grandTotal,
  }: {
    totalPrice: string;
    discount: string;
    tax: string;
    grandTotal: string;
  }
) => {
  if (!_FONT) return;
  const config = {
    font: _FONT,
    size: PAGE_FONT_SIZE,
    lineHeight: 15,
  };

  const columnPosition = 574;
  const Start_Y = 182;

  page.drawText(totalPrice, {
    x: columnPosition - getTextWidth(totalPrice, config),
    y: Start_Y,
    maxWidth: 100,
    ...config,
  });

  page.drawText(tax, {
    x: columnPosition - getTextWidth(tax, config),
    y: Start_Y - config.lineHeight,
    maxWidth: 100,
    ...config,
  });

  page.drawText(grandTotal, {
    x: columnPosition - getTextWidth(grandTotal, config),
    y: Start_Y - config.lineHeight * 2,
    maxWidth: 100,
    ...config,
  });

  // Price text - use installment amount if available
  const grandTotalNumber = _INSTALLMENT_DATA
    ? _INSTALLMENT_DATA.amountWithVat
    : parseFloat(grandTotal.replace(/,/g, ""));

  const thaiBahtText = convertToThaiBahtText(grandTotalNumber);
  page.drawText(thaiBahtText, {
    x: ITEM_X_Start + 30,
    y: Start_Y - config.lineHeight * 2,
    maxWidth: 100,
    ...config,
  });
};

const drawStaticInfo = (page: PDFPage, currentPageNumber: number) => {
  if (!_DATA) return;

  drawHeaderInfo(page, currentPageNumber);

  drawCustomerInfo(page);

  // Use installment amounts if available, otherwise use quotation amounts
  const priceData = _INSTALLMENT_DATA
    ? {
      discount: "0.00", // Installments typically don't have separate discount
      tax: (
        _INSTALLMENT_DATA.amountWithVat - _INSTALLMENT_DATA.amount
      ).toLocaleString("th-TH", CURRENCY_FORMAT),
      totalPrice: _INSTALLMENT_DATA.amount.toLocaleString(
        "th-TH",
        CURRENCY_FORMAT
      ),
      grandTotal: _INSTALLMENT_DATA.amountWithVat.toLocaleString(
        "th-TH",
        CURRENCY_FORMAT
      ),
    }
    : {
      discount:
        _DATA?.discount?.toLocaleString("th-TH", CURRENCY_FORMAT) ?? "",
      tax: _DATA?.tax?.toLocaleString("th-TH", CURRENCY_FORMAT) ?? "",
      totalPrice:
        ((_DATA?.totalPrice ?? 0) - (_DATA?.discount ?? 0)).toLocaleString("th-TH", CURRENCY_FORMAT) ?? "",
      grandTotal:
        _DATA?.grandTotal?.toLocaleString("th-TH", CURRENCY_FORMAT) ?? "",
    };

  drawPriceInfo(page, priceData);
};
