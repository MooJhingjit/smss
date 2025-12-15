"use client";

import React, { Component, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { History, AlertTriangle } from "lucide-react";
import PageComponentWrapper from "@/components/page-component-wrapper";
import { calculateQuotationItemPrice } from "@/app/services/service.quotation";
import {
  quotationStatusMapping,
} from "@/app/config";
import { QuotationStatus } from "@prisma/client";
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ============================================
// ERROR BOUNDARY - Prevents component from crashing the page
// ============================================
interface ErrorBoundaryState {
  hasError: boolean;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

class SnapshotErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Raw JSON fallback display
const RawJsonFallback = ({ content, code }: { content: any; code: string }) => (
  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
    <div className="flex items-center gap-2 mb-2 text-yellow-700">
      <AlertTriangle className="w-4 h-4" />
      <span className="text-sm font-medium">รูปแบบข้อมูลไม่รองรับ - แสดงข้อมูลดิบ ({code})</span>
    </div>
    <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto max-h-96">
      {JSON.stringify(content, null, 2)}
    </pre>
  </div>
);

// ============================================
// COLUMN CONFIGURATION - Easy to adjust
// ============================================

// Contact fields (from Contact model)
interface ContactInfo {
  id: number;
  name: string;
  email: string | null;
  taxId: string | null;
  branchId: string | null;
  phone: string | null;
  address: string | null;
  contact: string | null;
  fax: string | null;
}

// Seller fields (from User model)
interface SellerInfo {
  id: number;
  name: string;
  email: string | null;
  taxId: string | null;
  phone: string | null;
  address: string | null;
  contact: string | null;
  fax: string | null;
}

interface ListItem {
  id: number;
  name: string;
  quantity: number | null;
  unitPrice: number | null;
  price: number | null;
  unit: string | null;
  cost: number | null;
  percentage: number | null;
  discount: number | null;
  totalPrice: number | null;
  description: string | null;
  groupName: string | null;
  productType: string | null;
  withholdingTax: number | null;
  withholdingTaxPercent: number | null;
}

interface FieldConfig<T> {
  key: keyof T;
  label: string;
  format?: (value: any) => string;
}

// Configure which contact fields to show
const CONTACT_FIELDS: FieldConfig<ContactInfo>[] = [
  { key: "name", label: "ชื่อ" },
  { key: "email", label: "อีเมล" },
  { key: "phone", label: "โทรศัพท์" },
  { key: "taxId", label: "เลขประจำตัวผู้เสียภาษี" },
  { key: "branchId", label: "รหัสสาขา" },
  { key: "address", label: "ที่อยู่" },
  { key: "contact", label: "ผู้ติดต่อ" },
  { key: "fax", label: "แฟกซ์" },
];

// Configure which seller fields to show
const SELLER_FIELDS: FieldConfig<SellerInfo>[] = [
  { key: "name", label: "ชื่อ" },
  { key: "email", label: "อีเมล" },
  { key: "phone", label: "โทรศัพท์" },
  { key: "taxId", label: "เลขประจำตัวผู้เสียภาษี" },
  { key: "address", label: "ที่อยู่" },
  { key: "contact", label: "ผู้ติดต่อ" },
  { key: "fax", label: "แฟกซ์" },
];

interface ColumnConfig {
  key: keyof ListItem;
  label: string;
  align?: "left" | "right" | "center";
  format?: (value: any) => string;
  width?: string;
}

// Configure which list columns to show and how to format them
const LIST_COLUMNS: ColumnConfig[] = [
  { key: "name", label: "ชื่อสินค้า", align: "left", width: "200px" },
  { key: "quantity", label: "จำนวน", align: "center", format: (v) => v?.toString() || "-" },
  { key: "unit", label: "หน่วย", align: "center", format: (v) => v || "-" },
  { key: "unitPrice", label: "ราคาต่อหน่วย", align: "right", format: (v) => v?.toLocaleString() || "-" },
  { key: "discount", label: "ส่วนลด", align: "right", format: (v) => v?.toLocaleString() || "-" },
  { key: "price", label: "ราคารวม", align: "right", format: (v) => v?.toLocaleString() || "-" },
  { key: "cost", label: "ต้นทุน", align: "right", format: (v) => v?.toLocaleString() || "-" },
  { key: "percentage", label: "กำไร %", align: "right", format: (v) => v ? `${v}%` : "-" },
  { key: "withholdingTax", label: "หัก ณ ที่จ่าย", align: "right", format: (v) => v?.toLocaleString() || "-" },
  { key: "groupName", label: "กลุ่ม", align: "left", format: (v) => v || "-" },
];
// ============================================

interface QuotationSnapshot {
  id: number;
  quotationId: number;
  code: string;
  content: any; // Use 'any' to handle format changes gracefully
  createdAt: string;
}

// Typed content interface for when format is valid
interface SnapshotContent {
  code: string;
  type: string;
  grandTotal: number | null;
  totalPrice: number | null;
  discount: number | null;
  tax: number | null;
  vatIncluded: boolean;
  status: string;
  remark: string | null;
  contact?: ContactInfo;
  seller?: SellerInfo;
  lists?: ListItem[];
}

const fetchSnapshots = async (quotationId: number) => {
  const res = await fetch(`/api/quotation-snapshots/${quotationId}`);
  if (!res.ok) throw new Error("Failed to fetch snapshots");
  return res.json() as Promise<QuotationSnapshot[]>;
};

// Snapshot content renderer with error handling
const SnapshotContentRenderer = ({ content, code }: { content: any; code: string }) => {
  try {
    // Validate that content has expected structure
    const typedContent = content as SnapshotContent;

    // Calculate summary values from lists if not already present
    const calculatedSummary = typedContent.lists && typedContent.lists.length > 0
      ? calculateQuotationItemPrice(typedContent.lists as any, typedContent.vatIncluded ?? true)
      : null;

    // Use calculated values if the stored values are null/undefined
    const grandTotal = typedContent.grandTotal ?? calculatedSummary?.grandTotal ?? 0;
    const discount = typedContent.discount ?? calculatedSummary?.discount ?? 0;
    const tax = typedContent.tax ?? calculatedSummary?.vat ?? 0;

    return (
      <div className="space-y-4 pt-2">
        <div className="grid  grid-cols-2 gap-4">

          {/* Contact Info */}
          {typedContent.contact && (
            <div className="col-span-2 md:col-span-1">
              <p className="text-sm font-medium text-gray-700 mb-2">ข้อมูลลูกค้า</p>
              <div className="rounded-md p-3 bg-yellow-50 border border-yellow-400 text-yellow-800">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  {CONTACT_FIELDS.map((field) => (
                    <div key={field.key}>
                      <span className="text-gray-500">{field.label}:</span>{" "}
                      <span className="font-medium">
                        {field.format
                          ? field.format(typedContent.contact?.[field.key])
                          : typedContent.contact?.[field.key]?.toString() || "-"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Seller Info */}
          {typedContent.seller && (
            <div className="col-span-2 md:col-span-1">
              <p className="text-sm font-medium text-gray-700 mb-2">ข้อมูลผู้ขาย</p>
              <div className="rounded-md p-3 bg-gray-50 border border-gray-300 text-gray-800">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  {SELLER_FIELDS.map((field) => (
                    <div key={field.key}>
                      <span className="text-gray-500">{field.label}:</span>{" "}
                      <span className="font-medium">
                        {field.format
                          ? field.format(typedContent.seller?.[field.key])
                          : typedContent.seller?.[field.key]?.toString() || "-"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>


        {/* Product List - Table Format */}
        {typedContent.lists && typedContent.lists.length > 0 && (
          <div className="mt-3">
            <p className="text-sm font-medium text-gray-700 mb-2">
              รายการสินค้า ({typedContent.lists.length} รายการ)
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-100">
                  <tr>
                    {LIST_COLUMNS.map((col) => (
                      <th
                        key={col.key}
                        className={`px-2 py-1.5 font-medium text-gray-600 ${col.align === "right" ? "text-right" :
                          col.align === "center" ? "text-center" : "text-left"
                          }`}
                        style={{ minWidth: col.width }}
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {typedContent.lists.map((item, index) => (
                    <tr key={item.id || index} className="hover:bg-gray-50">
                      {LIST_COLUMNS.map((col) => (
                        <td
                          key={col.key}
                          className={`px-2 py-1.5 ${col.align === "right" ? "text-right" :
                            col.align === "center" ? "text-center" : "text-left"
                            } ${col.key === "name" ? "truncate max-w-[200px]" : ""}`}
                        >
                          {col.format
                            ? col.format(item[col.key])
                            : item[col.key]?.toString() || "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Summary Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div>
            <span className="text-gray-500">ยอดรวม:</span>{" "}
            <span className="font-medium">
              {grandTotal.toLocaleString("th-TH", {
                style: "currency",
                currency: "THB",
              })}
            </span>
          </div>
          <div>
            <span className="text-gray-500">ส่วนลด:</span>{" "}
            <span className="font-medium">
              {discount.toLocaleString("th-TH", {
                style: "currency",
                currency: "THB",
              })}
            </span>
          </div>
          <div>
            <span className="text-gray-500">VAT:</span>{" "}
            <span className="font-medium">
              {tax.toLocaleString("th-TH", {
                style: "currency",
                currency: "THB",
              })}
            </span>
          </div>
          <div>
            <span className="text-gray-500">สถานะ:</span>{" "}
            <Badge variant="secondary" className="text-xs">
              {quotationStatusMapping[typedContent.status as QuotationStatus].label || "-"}
            </Badge>
          </div>
        </div>


        {/* Remark */}
        {typedContent.remark && (
          <div className="mt-2">
            <p className="text-sm text-gray-500 text-red-500">
              หมายเหตุ: {typedContent.remark}
            </p>
          </div>
        )}
      </div>
    );
  } catch {
    // If any error occurs during rendering, show raw JSON
    return <RawJsonFallback content={content} code={code} />;
  }
};

const VersionLogs = ({ quotationId }: { quotationId: number }) => {
  const { data: snapshots, isLoading } = useQuery({
    queryKey: ["quotation-snapshots", quotationId],
    queryFn: () => fetchSnapshots(quotationId),
  });

  if (isLoading) {
    return (
      <div className="col-span-5 md:col-span-2">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-gray-500" />
            <h3 className="font-semibold text-gray-700">ประวัติเวอร์ชั่น</h3>
          </div>
          <p className="text-sm text-gray-500">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!snapshots || snapshots.length === 0) {
    return null
  }

  return (
    <div className="col-span-5 mb-6">
      <PageComponentWrapper
        headerIcon={<History className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-700" />}
        headerTitle="Snapshots"
      >
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <Accordion type="single" collapsible className="w-full">
            {snapshots.map((snapshot) => (
              <AccordionItem key={snapshot.id} value={`snapshot-${snapshot.id}`}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{snapshot.code}</Badge>
                    <span className="text-sm text-gray-500">
                      {formatDate(snapshot.createdAt)}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <SnapshotErrorBoundary
                    fallback={<RawJsonFallback content={snapshot.content} code={snapshot.code} />}
                  >
                    <SnapshotContentRenderer content={snapshot.content} code={snapshot.code} />
                  </SnapshotErrorBoundary>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </PageComponentWrapper>
    </div>
  );
};

export default VersionLogs;