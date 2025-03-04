import { db } from "@/lib/db";
import {
  PurchaseOrder,
  PurchaseOrderItem,
  User,
} from "@prisma/client";
import { PDFDocument, PDFFont, PDFPage, rgb } from "pdf-lib";
import { getBoundingBox, loadSignatureImage, PDFDateFormat, loadPdfAssets, validatePageArea, getTextWidth } from "./pdf.helpers";


let _BILL_DATE = ""
let _DATA: PurchaseOrderWithRelations | null = null
let _FONT: PDFFont | null = null;
const PAGE_FONT_SIZE = 8;
const LIST_END_AT = 210;

const ITEM_X_Start = 44;
// horizontal position
const columnPosition = {
  index: ITEM_X_Start,
  description: ITEM_X_Start + 30,
  quantity: ITEM_X_Start + 359,
  unit: ITEM_X_Start + 390,
  unitPrice: ITEM_X_Start + 420,
  amount: ITEM_X_Start + 485,
};



const CURRENCY_FORMAT = {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
};

type PurchaseOrderWithRelations = PurchaseOrder & {
  purchaseOrderItems?: PurchaseOrderItem[];
  vendor: User | null;
};

const getData = async (
  id: number
): Promise<PurchaseOrderWithRelations | null> => {
  const purchaseOrder = await db.purchaseOrder.findUnique({
    include: {
      purchaseOrderItems: true,
      vendor: true,
    },
    where: {
      id: parseInt(id.toString()),
    },
  });

  return purchaseOrder;
};

export const generateInvoice = async (id: number, date: string) => {
  try {
    if (!id) {
      throw new Error("Invalid quotation ID");
    }

    _BILL_DATE = PDFDateFormat(new Date(date))

    const purchaseOrder = await getData(id);

    if (!purchaseOrder) {
      throw new Error("PurchaseOrder not found");
    }

    _DATA = purchaseOrder
    return generate();
  } catch (error) {
    console.log(error);
    throw new Error("Error writing PDF file");
  }
};

const generate = async () => {
  if (!_DATA) return;
  // list start position
  const ITEM_Y_Start = 585;
 

  const { pdfDoc, font, template } = await loadPdfAssets("pdf/purchase-order-template.pdf");
  const templatePage = await pdfDoc.embedPage(template.getPages()[0]);

  _FONT = font;

  const config = {
    size: PAGE_FONT_SIZE,
    lineHeight: 11,
    font: _FONT,
  };

  let page = pdfDoc.addPage();
  page.drawPage(templatePage);

  // draw approver signature
  const approverSignature = await loadSignatureImage("1");
  const approverSignatureImage = await page.doc.embedPng(approverSignature.imageBytes as any);
  page.drawImage(approverSignatureImage, {
    x: 380,
    y: 45,
    ...approverSignatureImage.scale(approverSignature.scale)
  })
  page.drawText(_BILL_DATE, {
    x: 380,
    y: 35,
    ...config
  })


  drawStaticInfo(page, 1);

  let lineStart = ITEM_Y_Start;

  // write item list
  _DATA.purchaseOrderItems?.forEach((list, index) => {
    if (index > 0) {
      lineStart -= config.lineHeight; // space between main items
    }

    const mainItemRes = validatePageArea(
      page,
      pdfDoc,
      templatePage,
      lineStart,
      LIST_END_AT,
      ITEM_Y_Start,
      (currentPage: PDFPage, currentLineStart: number) =>
        writeMainItem(currentPage, index, list, currentLineStart, config, pdfDoc)
    );
    lineStart = mainItemRes.lineStart;
    page = mainItemRes.page;

    if (list.description) {
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
    }
  });

  const modifiedPdfBytes = await pdfDoc.save();
  return {
    pdfBytes: modifiedPdfBytes,
  };
};

const writeMainItem = (
  currentPage: PDFPage,
  index: number,
  data: PurchaseOrderItem,
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

  // remark withholdingTax
  if (
    data.withholdingTaxEnabled
  ) {
    currentPage.drawText("**", {
      x: columnPosition.description - 8,
      y: lineStart,
      maxWidth: 5,
      color: rgb(255 / 255, 0 / 255, 0 / 255),
      ...config,
      // lineHeight: breakLineHeight,
    });
  }

  currentPage.drawText(data.name, {
    x: columnPosition.description,
    y: lineStart,
    maxWidth: 600,
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

  currentPage.drawText(data.unit ?? "", {
    x: columnPosition.unit,
    y: lineStart,
    maxWidth: 20,
    ...config,
  });

  const unitPrice = data.unitPrice
    ? data.unitPrice.toLocaleString("th-TH", CURRENCY_FORMAT)
    : "";

  currentPage.drawText(data.unitPrice?.toLocaleString("th-TH", CURRENCY_FORMAT) ?? "", {
    x: columnPosition.unitPrice + 44 - getTextWidth(unitPrice, config),
    y: lineStart,
    maxWidth: 20,
    ...config,
  });

  const amountText = data.price
    ? data.price.toLocaleString("th-TH", CURRENCY_FORMAT)
    : "";
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
    600
  );

  return bounding.height / 10;
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
  currentPage.drawText(description, {
    x: columnPosition.description + 12, // indent
    y: lineStart,
    maxWidth: 300,
    ...config,
    opacity: 0.5,
  });

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
  const Y_Start = 790;
  const config = {
    font: _FONT,
    size: PAGE_FONT_SIZE,
    lineHeight: 16,
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

const drawVendorInfo = (page: PDFPage) => {
  if (!_DATA || !_FONT) return;
  const config = {
    font: _FONT,
    size: PAGE_FONT_SIZE,
    lineHeight: 16,
  };

  const vendor = _DATA?.vendor
  if (!vendor) {
    return
  }

  const Y_Start = 720;
  const X_Start = 80;
  page.drawText(vendor.name, {
    x: X_Start,
    y: Y_Start,
    maxWidth: 600,
    ...config,
  });

  page.drawText(vendor.address ?? "", {
    x: X_Start,
    y: Y_Start - config.lineHeight,
    maxWidth: 300,
    ...config,
  });

  page.drawText(vendor.contact ?? "", {
    x: X_Start,
    y: Y_Start - config.lineHeight * 3, // the third line
    maxWidth: 300,
    ...config,
  });

  page.drawText(_DATA?.vendorQtCode ?? "", {
    x: 440,
    y: Y_Start,
    maxWidth: 100,
    ...config,
  });


  page.drawText(vendor.phone ?? "", {
    x: 440,
    y: Y_Start - config.lineHeight,
    maxWidth: 100,
    ...config,
  });

  page.drawText(vendor.email ?? "", {
    x: 440,
    y: Y_Start - config.lineHeight * 3,
    maxWidth: 100,
    ...config,
  });
};

const drawOrdererInfo = (page: PDFPage) => {
  if (!_FONT) return;
  const config = {
    font: _FONT,
    size: PAGE_FONT_SIZE,
    lineHeight: 14,
  };

  page.drawText("จันทินี นาวีว่อง  08-1868-3146", {
    x: 125,
    y: 640,
    maxWidth: 500,
    ...config,
  });

  page.drawText(_BILL_DATE, {
    x: 500,
    y: 640,
    maxWidth: 100,
    ...config,
  });
};

const drawRemarkInfo = (page: PDFPage) => {
  if (!_DATA || !_FONT) return;
  const config = {
    font: _FONT,
    size: PAGE_FONT_SIZE,
    lineHeight: 14,

  };

  // remark
  page.drawText(_DATA.remark ?? "", {
    x: 35,
    y: 175,
    maxWidth: 350,
    color: rgb(255 / 255, 0 / 255, 0 / 255),
    ...config,
  });

  // withholdingTax summary
  const withholdingTaxSummary = _DATA.purchaseOrderItems?.filter(item => item.withholdingTaxEnabled)
    .reduce((acc, item) => {
      return acc + (item.withholdingTax ?? 0)
    }, 0) ?? 0

  if (withholdingTaxSummary) {
    const priceAfterTax = (_DATA?.grandTotal ?? 0) - withholdingTaxSummary

    const items = [
      {
        label: 'ราคาก่อนภาษี',
        value: _DATA.totalPrice?.toLocaleString("th-TH", CURRENCY_FORMAT) + ' บาท'
      },
      {
        label: 'หัก ณ ที่จ่าย 3%',
        value: withholdingTaxSummary?.toLocaleString("th-TH", CURRENCY_FORMAT) + ' บาท'
      },
      {
        label: 'ราคาหลังจากหัก ณ ที่จ่าย',
        value: priceAfterTax.toLocaleString("th-TH", CURRENCY_FORMAT) + ' บาท'
      },
    ];

    if (_DATA.extraCost) {
      items.push({
        label: '*ต้นทุนเพิ่ม',
        value: _DATA.extraCost?.toLocaleString("th-TH", CURRENCY_FORMAT) + ' บาท'
      })
    }

    page.drawText("**", {
      x: 260,
      y: 190,
      maxWidth: 400,
      color: rgb(255 / 255, 0 / 255, 0 / 255),

      ...config,
    });
    items.forEach((item, index) => {
      page.drawText(`${item.label}: ${item.value}`, {
        x: 270,
        y: 190 - (index * 15),
        maxWidth: 400,
        ...config,
      });
    });
  }

};

const drawPriceInfo = (page: PDFPage) => {
  if (!_DATA || !_FONT) return;
  const config = {
    font: _FONT,
    size: PAGE_FONT_SIZE,
    lineHeight: 14,
  };

  const columnPosition = 520;
  

  page.drawText(_DATA.price?.toLocaleString("th-TH", CURRENCY_FORMAT) ?? "", {
    x: columnPosition + 48 - getTextWidth(_DATA.price?.toLocaleString("th-TH", CURRENCY_FORMAT) ?? "", config),
    y: 187,
    maxWidth: 100,
    ...config,
  });

  page.drawText(_DATA.discount?.toLocaleString("th-TH", CURRENCY_FORMAT) ?? "", {
    x: columnPosition + 48 - getTextWidth(_DATA.discount?.toLocaleString("th-TH", CURRENCY_FORMAT) ?? "", config),
    y: 167,
    maxWidth: 100,
    ...config,
  });

  page.drawText(_DATA.totalPrice?.toLocaleString("th-TH", CURRENCY_FORMAT) ?? "", {
    x: columnPosition + 48 - getTextWidth(_DATA.totalPrice?.toLocaleString("th-TH", CURRENCY_FORMAT) ?? "", config),
    y: 144,
    maxWidth: 100,
    ...config,
  });

  page.drawText(_DATA.vat?.toLocaleString("th-TH", CURRENCY_FORMAT) ?? "", {
    x: columnPosition + 48 - getTextWidth(_DATA.vat?.toLocaleString("th-TH", CURRENCY_FORMAT) ?? "", config),
    y: 125,
    maxWidth: 100,
    ...config,
  });

  page.drawText(_DATA.grandTotal?.toLocaleString("th-TH", CURRENCY_FORMAT) ?? "", {
    x: columnPosition + 48 - getTextWidth(_DATA.grandTotal?.toLocaleString("th-TH", CURRENCY_FORMAT) ?? "", config),
    y: 106,
    maxWidth: 100,
    ...config,
  });
};

const drawStaticInfo = (
  page: PDFPage,
  currentPageNumber: number
) => {
  if (!_DATA) return;

  drawHeaderInfo(page, currentPageNumber, {
    code: _DATA.code,
    date: _BILL_DATE,
  });

  if (_DATA.vendor) drawVendorInfo(page);

  drawOrdererInfo(page);
  drawRemarkInfo(page);
  drawPriceInfo(page);
};
