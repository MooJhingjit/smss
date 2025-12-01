import { db } from "@/lib/db";
import { Contact, Quotation, QuotationList, User } from "@prisma/client";
import {
  PDFDocument,
  PDFFont,
  PDFPage,
  rgb,
  PDFEmbeddedPage,
  degrees,
  PDFImage,
} from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import {
  getBoundingBox,
  getCustomerNameWithBranch,
  getPaymentCondition,
  loadSignatureImage,
  PDFDateFormat,
} from "./pdf.helpers";
import { getDateFormat } from "@/lib/utils";
import path from "path";
import { readFile } from "fs/promises";
import {
  calculateQuotationItemPrice,
  // summarizeQuotationTotalPrice,
} from "../service.quotation";

const PAGE_FONT_SIZE = 8;
const CURRENCY_FORMAT = {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
};
let _BILL_DATE = "";
let _DATA: QuotationWithRelations | null = null;
let _FONT: PDFFont | null = null;

type QuotationWithRelations = Quotation & {
  lists: QuotationList[];
  seller: User | null;
  contact: Contact;
};

const getQuotation = async (
  id: number
): Promise<QuotationWithRelations | null> => {
  const quotation = await db.quotation.findUnique({
    include: {
      lists: {
        include: {
          product: true,
        },
        where: {
          hiddenInPdf: false, // only include items that are not hidden in PDF
        },
        orderBy: {
          order: "asc", // order by the order field
        },
      },
      seller: true,
      contact: true,
    },
    where: {
      id: parseInt(id.toString()),
    },
  });

  return quotation;
};

export const generateQuotationPaper = async (id: number, date: string) => {
  try {
    if (!id) {
      throw new Error("Invalid quotation ID");
    }

    _BILL_DATE = PDFDateFormat(new Date(date));

    const quotation = await getQuotation(id);

    if (!quotation) {
      throw new Error("Quotation not found");
    }

    let temporaryQuotationTotalPrice = {};
    // check if total price is not yet calculated
    if (!quotation.grandTotal) {
      const { totalPrice, discount, vat, grandTotal } =
        calculateQuotationItemPrice(quotation.lists);

      temporaryQuotationTotalPrice = {
        totalPrice,
        discount,
        tax: vat,
        grandTotal,
      };
    }

    _DATA = { ...quotation, ...temporaryQuotationTotalPrice };
    return generate(id);
  } catch (error) {
    console.log(error);
    throw new Error("Error writing PDF file");
  }
};

const generate = async (id: number) => {
  if (!_DATA) return;
  // list start position
  const ITEM_Y_Start = 573;
  const ITEM_X_Start = 40;

  // Track the current page number as a reference object so it can be updated from validatePageArea
  const pageNumberRef = { currentPageNumber: 1 };

  // horizontal position
  const columnPosition = {
    index: ITEM_X_Start,
    description: ITEM_X_Start + 25,
    quantity: ITEM_X_Start + 374,
    unitPrice: ITEM_X_Start + 430,
    amount: ITEM_X_Start + 490,
  };

  const fontResolvePath = path.resolve("./public", "fonts/Sarabun-Regular.ttf"); // sarabun-new
  const fontPath = path.join(fontResolvePath);

  const templateResolvePath = path.resolve(
    "./public",
    "pdf/quotation-template2.pdf"
  );

  const pdfTemplatePath = path.join(templateResolvePath);
  const [pdfDoc, fontData, existingPdfBytes] = await Promise.all([
    PDFDocument.create(),
    readFile(fontPath),
    readFile(pdfTemplatePath),
  ]);

  pdfDoc.registerFontkit(fontkit);
  _FONT = await pdfDoc.embedFont(fontData as any, { subset: true });
  const template = await PDFDocument.load(existingPdfBytes as any);
  const templatePage = await pdfDoc.embedPage(template.getPages()[0]);

  const config: ListConfig = {
    size: PAGE_FONT_SIZE,
    lineHeight: 11,
    font: _FONT,
  };

  const writeMainItem = (
    currentPage: PDFPage,
    index: number,
    data: QuotationList,
    lineStart: number
  ) => {
    currentPage.drawText((index + 1).toString(), {
      x: columnPosition.index,
      y: lineStart,
      maxWidth: 20,
      ...config,
    });

    // main item name
    currentPage.drawText(data.name, {
      x: columnPosition.description,
      y: lineStart,
      maxWidth: 300,
      ...config,
      // lineHeight: breakLineHeight,
    });

    // Quantity
    currentPage.drawText(data.quantity ? data.quantity.toString() : "", {
      x: columnPosition.quantity,
      y: lineStart,
      maxWidth: 20,
      ...config,
    });

    // Unit
    const unitText = data.unit ? data.unit : "";
    const unitTextWidth = getTextWidth(unitText, config);
    const unitTextX = columnPosition.quantity + 34 - unitTextWidth / 2; // Center align
    currentPage.drawText(unitText, {
      x: unitTextX,
      y: lineStart,
      maxWidth: 50,
      ...config,
    });

    // Unit Price
    const unitPriceText = data.unitPrice
      ? data.unitPrice.toLocaleString("th-TH", CURRENCY_FORMAT)
      : "0.00";
    currentPage.drawText(unitPriceText, {
      x: columnPosition.unitPrice + 44 - getTextWidth(unitPriceText, config),
      y: lineStart,
      maxWidth: 50,
      ...config,
    });

    // Amount
    let itemAmount = 0;
    if (data.unitPrice) {
      const quantity = data?.quantity || 1;
      itemAmount = data.unitPrice * quantity;
    }
    const amountText = itemAmount.toLocaleString("th-TH", CURRENCY_FORMAT);

    currentPage.drawText(amountText, {
      x: columnPosition.amount + 44 - getTextWidth(amountText, config),
      y: lineStart,
      maxWidth: 50,
      ...config,
    });

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

  const writeGroupName = (
    currentPage: PDFPage,
    groupName: string,
    lineStart: number
  ) => {
    // Draw a border around the group name
    const padding = 0;
    const text = groupName || "";
    // const textWidth = getTextWidth(text, config);
    // const boxWidth = textWidth + (padding * 2);

    // Draw border
    // currentPage.drawRectangle({
    //   x: columnPosition.description,
    //   y: lineStart - padding,
    //   width: boxWidth,
    //   height: config.lineHeight + padding,
    //   borderColor: rgb(0, 0, 0),
    //   borderWidth: 0.5,
    //   color: rgb(245/255, 245/255, 245/255),
    // });

    // Draw text
    currentPage.drawText(text, {
      x: columnPosition.description + padding,
      y: lineStart,
      maxWidth: 300,
      ...config,
      color: rgb(1, 0.549, 0),
    });

    return config.lineHeight + 5; // Return height used including some spacing
  };

  const writeMainDescription = (
    currentPage: PDFPage,
    description: string,
    lineStart: number
  ) => {
    const endUserRegex = /End user|หมายเหตุ/gi;

    if (endUserRegex.test(description)) {
      // Apply red color to the entire line if "End user" is detected
      currentPage.drawText(description, {
        x: columnPosition.description + 12, // indent
        y: lineStart,
        maxWidth: 300,
        ...config,
        opacity: 1,
        color: rgb(1, 0, 0), // Red color for entire line
      });
    } else {
      // No "End user" found, draw normally
      currentPage.drawText(description, {
        x: columnPosition.description + 12, // indent
        y: lineStart,
        maxWidth: 300,
        ...config,
        opacity: 0.5,
      });
    }

    const bounding = getBoundingBox(
      description,
      pdfDoc,
      _FONT,
      PAGE_FONT_SIZE,
      config.lineHeight + 4,
      300
    );

    return bounding.height / 10;
  };

  const writeSubItem = (
    currentPage: PDFPage,
    subItem: { label: string; quantity: string },
    lineStart: number
  ) => {
    // get current page number
    currentPage.drawText(subItem.label, {
      x: columnPosition.description + 12, // indent
      y: lineStart,
      maxWidth: 300,
      ...config,
      // lineHeight: breakLineHeight,
    });
    currentPage.drawText(subItem.quantity, {
      x: columnPosition.quantity, // indent
      y: lineStart,
      maxWidth: 50,
      ...config,
    });

    const bounding = getBoundingBox(
      subItem.label,
      pdfDoc,
      _FONT,
      PAGE_FONT_SIZE,
      config.lineHeight + 4,
      300
    );

    return bounding.height / 10;
  };

  let page = pdfDoc.addPage();
  page.drawPage(templatePage);

  // Load signature images once at the beginning - this is more efficient
  const APPROVER_ID = 2;
  const approver = await db.user.findFirst({
    where: {
      id: APPROVER_ID,
    },
  });

  const approverSignature = await loadSignatureImage(APPROVER_ID.toString());
  const approverSignatureImage = await pdfDoc.embedPng(
    approverSignature.imageBytes as any
  );

  // Load seller signature if available
  const sellerId = _DATA.seller?.id;
  let sellerSignatureImage = null;
  let sellerSignature = null;
  if (sellerId) {
    sellerSignature = await loadSignatureImage(sellerId.toString());
    sellerSignatureImage = await pdfDoc.embedPng(
      sellerSignature.imageBytes as any
    );
  }

  // Store these values to be used in drawSignature function
  const signatureData = {
    // approver information
    approverSignatureImage,
    approverSignatureImageScale: approverSignature.scale,
    approverName: approver?.name ?? "",
    approverPhone: approver?.phone ?? "",

    // seller information
    sellerName: _DATA.seller?.name ?? "",
    sellerSignatureImage,
    sellerPhone: _DATA.seller?.phone ?? "",
    sellerSignatureImageScale: sellerSignature ? sellerSignature.scale : null,
  };

  // check qt status, if not open or pending_approval

  // Draw signatures on the first page
  drawSignature(page, signatureData);

  drawStaticInfo(page, pageNumberRef.currentPageNumber);

  let lineStart = ITEM_Y_Start;

  _DATA.lists?.forEach((list, index) => {
    if (index > 0) {
      lineStart -= config.lineHeight; // space between main items
    }

    // Check if groupName exists and render it with border
    if (list.groupName) {
      const groupNameRes = validatePageArea(
        page,
        pdfDoc,
        templatePage,
        lineStart,
        ITEM_Y_Start,
        (currentPage: PDFPage, currentLineStart: number) =>
          writeGroupName(
            currentPage,
            list.groupName as string,
            currentLineStart
          ),
        pageNumberRef,
        signatureData
      );
      lineStart = groupNameRes.lineStart;
      page = groupNameRes.page;
    }

    const mainItemRes = validatePageArea(
      page,
      pdfDoc,
      templatePage,
      lineStart,
      ITEM_Y_Start,
      (currentPage: PDFPage, currentLineStart: number) =>
        writeMainItem(currentPage, index, list, currentLineStart),
      pageNumberRef,
      signatureData
    );
    lineStart = mainItemRes.lineStart;
    page = mainItemRes.page;

    if (list.description) {
      const descriptionLines = list.description.split("\n");

      descriptionLines.forEach((descriptionLine, idx) => {
        const text =
          typeof descriptionLine === "string" ? descriptionLine : " ";

        const mainDescriptionRes = validatePageArea(
          page,
          pdfDoc,
          templatePage,
          lineStart,
          ITEM_Y_Start,
          (currentPage: PDFPage, currentLineStart: number) =>
            writeMainDescription(currentPage, text || " ", currentLineStart),
          pageNumberRef,
          signatureData
        );

        lineStart = mainDescriptionRes.lineStart;
        page = mainDescriptionRes.page;
      });
    }

    // write subItems
    const subItems = JSON.parse(list.subItems ?? "[{}]");
    if (subItems.length > 0) {
      subItems.forEach(
        (subItem: { label: string; quantity: string }, idx: number) => {
          const subItemRes = validatePageArea(
            page,
            pdfDoc,
            templatePage,
            lineStart,
            ITEM_Y_Start,
            (currentPage: PDFPage, currentLineStart: number) =>
              writeSubItem(currentPage, subItem, currentLineStart),
            pageNumberRef,
            signatureData
          );

          lineStart = subItemRes.lineStart;
          page = subItemRes.page;
        }
      );
    }
  });

  // show price on the last page
  const currencyFormat = {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };
  // total = sub total - discount

  const total = _DATA.totalPrice ? _DATA.totalPrice - (_DATA.discount ?? 0) : 0;
  drawPriceInfo(page, {
    discount: _DATA.discount?.toLocaleString("th-TH", currencyFormat) ?? "",
    tax: _DATA.tax?.toLocaleString("th-TH", currencyFormat) ?? "",
    totalPrice: _DATA.totalPrice?.toLocaleString("th-TH", currencyFormat) ?? "", // sub total
    total: total.toLocaleString("th-TH", currencyFormat) ?? "",
    grandTotal: _DATA.grandTotal?.toLocaleString("th-TH", currencyFormat) ?? "",
  });

  const modifiedPdfBytes = await pdfDoc.save();
  return {
    pdfBytes: modifiedPdfBytes,
  };
};

const drawHeaderInfo = (
  page: PDFPage,
  currentPageNumber: number,
  {
    code,
    date,
  }: {
    code: string;
    date: string;
  }
) => {
  if (!_FONT) return;
  const X_Start = 480;
  const Y_Start = 800;

  const config = {
    font: _FONT,
    size: PAGE_FONT_SIZE,
    lineHeight: 15,
  };
  page.drawText(date, {
    x: X_Start,
    y: Y_Start,
    maxWidth: 100,
    ...config,
  });
  page.drawText(code, {
    x: X_Start,
    y: Y_Start - config.lineHeight,
    maxWidth: 100,
    ...config,
  });
  page.drawText(currentPageNumber.toString(), {
    x: X_Start,
    y: Y_Start - config.lineHeight * 2,
    maxWidth: 100,
    ...config,
  });
};

const drawCustomerInfo = (page: PDFPage, contact: Contact) => {
  if (!_FONT) return;
  const config = {
    font: _FONT,
    size: PAGE_FONT_SIZE,
    lineHeight: 14,
  };

  const Y_Start = 713;
  const X_Start = 70;
  // name + branchId

  page.drawText(getCustomerNameWithBranch(contact.name, contact.branchId), {
    x: X_Start,
    y: Y_Start,
    maxWidth: 600,
    ...config,
  });

  page.drawText(contact.address ?? "", {
    x: X_Start,
    y: Y_Start - config.lineHeight,
    maxWidth: 300,
    ...config,
  });

  page.drawText(contact.contact ?? "", {
    x: X_Start,
    y: Y_Start - config.lineHeight * 3, // the third line
    maxWidth: 300,
    ...config,
  });

  page.drawText(contact.phone ?? "", {
    x: 440,
    y: Y_Start - config.lineHeight,
    maxWidth: 100,
    ...config,
  });

  page.drawText(contact.fax ?? "", {
    x: 440,
    y: Y_Start - config.lineHeight * 2,
    maxWidth: 100,
    ...config,
  });

  page.drawText(contact.email ?? "", {
    x: 440,
    y: Y_Start - config.lineHeight * 3,
    maxWidth: 100,
    ...config,
  });
};

const drawOfferInfo = (
  page: PDFPage,
  {
    sellerName,
    paymentDue,
    deliveryPeriod,
    validPricePeriod,
  }: {
    sellerName: string;
    paymentDue: string;
    deliveryPeriod: string;
    validPricePeriod: string;
  }
) => {
  if (!_FONT) return;
  const config = {
    font: _FONT,
    size: PAGE_FONT_SIZE,
    lineHeight: 14,
  };

  const Y_Start = 630;
  page.drawText(sellerName, {
    x: 65,
    y: Y_Start,
    maxWidth: 150,
    ...config,
  });

  // page.drawText(getPaymentCondition(paymentCondition), {
  //   x: 265,
  //   y: Y_Start,
  //   maxWidth: 150,
  //   ...config,
  // });

  page.drawText(paymentDue, {
    x: 260,
    y: Y_Start,
    maxWidth: 500,
    ...config,
  });
  page.drawText(deliveryPeriod, {
    x: 420,
    y: Y_Start,
    maxWidth: 100,
    ...config,
  });
  page.drawText(validPricePeriod, {
    x: 500,
    y: Y_Start,
    maxWidth: 100,
    ...config,
  });
};

const drawRemarkInfo = (page: PDFPage, text: string) => {
  if (!_FONT) return;
  const config = {
    font: _FONT,
    size: PAGE_FONT_SIZE,
    lineHeight: 14,
    color: rgb(255 / 255, 0 / 255, 0 / 255),
  };

  page.drawText(text, {
    x: 65,
    y: 175,
    maxWidth: 350,
    ...config,
  });
};

const drawPriceInfo = (
  page: PDFPage,
  {
    totalPrice, // sub total
    total,
    discount,
    tax,
    grandTotal,
  }: {
    totalPrice: string; // sub total
    total: string;
    discount: string;
    tax: string;
    grandTotal: string;
  }
) => {
  if (!_FONT) return;
  const config = {
    font: _FONT,
    size: PAGE_FONT_SIZE,
    lineHeight: 14,
  };

  const columnPosition = 523;

  page.drawText(totalPrice, {
    x: columnPosition + 48 - getTextWidth(totalPrice, config),
    y: 174,
    maxWidth: 100,
    ...config,
  });

  page.drawText(discount, {
    x: columnPosition + 48 - getTextWidth(discount, config),
    y: 159, // updated y position
    maxWidth: 100,
    ...config,
    color: discount !== "0.00" ? rgb(1, 0.549, 0) : rgb(0, 0, 0), // orange color for discount if not zero
  });

  page.drawText(total, {
    x: columnPosition + 48 - getTextWidth(total, config),
    y: 144,
    maxWidth: 100,
    ...config,
  });

  page.drawText(tax, {
    x: columnPosition + 48 - getTextWidth(tax, config),
    y: 130,
    maxWidth: 100,
    ...config,
  });

  page.drawText(grandTotal, {
    x: columnPosition + 48 - getTextWidth(grandTotal, config),
    y: 109,
    maxWidth: 100,
    ...config,
  });
};

// Define a type for signature data to pass around
type SignatureData = {
  approverSignatureImage: PDFImage;
  approverSignatureImageScale: number;
  approverPhone: string;
  sellerSignatureImage: PDFImage | null;
  sellerSignatureImageScale: number | null;
  sellerPhone: string;
  approverName: string;
  sellerName: string;
};

const drawSignature = (page: PDFPage, signatureData: SignatureData) => {
  if (!_FONT) return;

  const config = {
    font: _FONT,
    size: PAGE_FONT_SIZE - 1,
    lineHeight: 14,
  };

  // check qt status, if not open or pending_approval then do not draw signature
  const isShowApproverSignature = !["open", "pending_approval"].includes(
    _DATA?.status ?? ""
  );

  if (isShowApproverSignature) {
    // Draw approver name
    page.drawText(
      signatureData.approverName + " " + signatureData.approverPhone,
      {
        x: 450,
        y: 74,
        ...config,
      }
    );

    // Draw approver signature
    page.drawImage(signatureData.approverSignatureImage, {
      x: 460,
      y: 53,
      ...signatureData.approverSignatureImage.scale(
        signatureData.approverSignatureImageScale
      ),
    });

    // Approver phone
    // page.drawText(signatureData.approverPhone, {
    //   x: 460,
    //   y: 63,
    //   ...config,

    // });

    // Approver date
    // const approvedDate = _DATA?.approvedAt
    //   ? PDFDateFormat(new Date(_DATA.approvedAt))
    //   : _BILL_DATE;
    page.drawText(_BILL_DATE, {
      x: 470,
      y: 40,
      ...config,
      size: PAGE_FONT_SIZE - 1,
    });
  }

  // Draw seller signature if available
  if (signatureData.sellerSignatureImage) {
    // Draw seller name
    page.drawText(signatureData.sellerName + " " + signatureData.sellerPhone, {
      x: 270,
      y: 74,
      ...config,
    });

    page.drawImage(signatureData.sellerSignatureImage, {
      x: 280,
      y: 53,
      ...signatureData.sellerSignatureImage.scale(
        signatureData.sellerSignatureImageScale ?? 0
      ),
    });

    // Seller phone
    // page.drawText(signatureData.sellerPhone, {
    //   x: 290,
    //   y: 63,
    //   ...config,
    // });

    // Seller date
    // const offeredDate = _DATA?.offeredAt
    //   ? PDFDateFormat(new Date(_DATA.offeredAt))
    //   : _BILL_DATE;
    page.drawText(_BILL_DATE, {
      x: 280,
      y: 40,
      ...config,
      size: PAGE_FONT_SIZE - 1,
    });
  }
};

type ListConfig = {
  size: number;
  lineHeight: number;
  font: PDFFont;
};

const END_POSITION = 210;

const validatePageArea = (
  page: PDFPage,
  pdfDoc: PDFDocument,
  templatePage: PDFEmbeddedPage,
  lineStart: number,
  ITEM_Y_Start: number,
  exc: any,
  pageNumberRef: { currentPageNumber: number },
  signatureData: SignatureData
) => {
  if (!_DATA) return { page, lineStart };
  if (lineStart < END_POSITION) {
    pageNumberRef.currentPageNumber++;
    const newPage = pdfDoc.addPage();
    newPage.drawPage(templatePage);
    drawStaticInfo(newPage, pageNumberRef.currentPageNumber);
    // Draw signatures on each new page
    drawSignature(newPage, signatureData);

    lineStart = ITEM_Y_Start;

    let heightUsed = exc(newPage, lineStart);
    return {
      page: newPage,
      lineStart: lineStart - heightUsed,
    };
  }

  let heightUsed = exc(page, lineStart);
  return {
    page: page,
    lineStart: lineStart - heightUsed,
  };
};

const getTextWidth = (text: string, config: ListConfig) => {
  return config.font.widthOfTextAtSize(text, config.size);
};

const drawStaticInfo = (page: PDFPage, currentPageNumber: number) => {
  if (!_DATA) return;
  drawHeaderInfo(page, currentPageNumber, {
    code: _DATA.code,
    date: _BILL_DATE, // _DATA.approvedAt ? PDFDateFormat(new Date(_DATA.approvedAt)) : PDFDateFormat(new Date()),
  });
  drawCustomerInfo(page, {
    ..._DATA.contact,
    contact: _DATA.overrideContactName ?? _DATA.contact.contact,
    email: _DATA.overrideContactEmail ?? _DATA.contact.email,
    phone: _DATA.overrideContactPhone ?? _DATA.contact.phone,
  });
  drawOfferInfo(page, {
    sellerName: _DATA.seller?.name ?? "",
    paymentDue:
      _DATA.paymentType === "credit"
        ? _DATA.paymentCondition + "วัน"
        : "เงินสด",
    deliveryPeriod: _DATA.deliveryPeriod
      ? _DATA.deliveryPeriod?.toString() + " วัน"
      : "",
    validPricePeriod: _DATA.validPricePeriod
      ? _DATA.validPricePeriod?.toString() + " วัน"
      : "",
    // paymentCondition: _DATA.paymentCondition ?? "",
  });
  drawRemarkInfo(page, _DATA.remark ?? "");

  // const currencyFormat = {
  //   minimumFractionDigits: 2,
  //   maximumFractionDigits: 2,
  // };
  // drawPriceInfo(page, {
  //   discount: _DATA.discount?.toLocaleString("th-TH", currencyFormat) ?? "",
  //   tax: _DATA.tax?.toLocaleString("th-TH", currencyFormat) ?? "",
  //   totalPrice: _DATA.totalPrice?.toLocaleString("th-TH", currencyFormat) ?? "",
  //   grandTotal: _DATA.grandTotal?.toLocaleString("th-TH", currencyFormat) ?? "",
  // });
  // drawSignature(page);
};
