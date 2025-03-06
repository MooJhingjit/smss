import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCurrentDateTime(): Date {
  // Get current date and time in Bangkok timezone as string
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };

  // Format the date for Bangkok timezone
  const bangkokTimeString = now
    .toLocaleString("en-GB", options)
    .replace(",", "");

  // Extract date and time parts
  const [date, time] = bangkokTimeString.split(" ");
  const [day, month, year] = date.split("/");
  const [hour, minute, second] = time.split(":");

  // Create a new Date object as if the time is local in Bangkok
  const bangkokDate = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second)
  );

  return bangkokDate;
}

export function classNames(...classes: ClassValue[]) {
  return classes.filter(Boolean).join(" ");
}

export const codeLength = 6;

export function generateCode(
  id: number,
  prefix: "S_QT" | "QT" | "PO",
  date: Date,
  number: number
) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const runNumber = number.toString().padStart(4, "0");

  return `${prefix}${year}${month}${runNumber}`;
}

export function parseSequenceNumber(code: string): number {
  if (!code) {
    return 1;
  }
  // If there's a dash (e.g. "-R1"), split to remove the revision suffix.
  const dashIndex = code.indexOf("-");
  const baseCode = dashIndex >= 0 ? code.substring(0, dashIndex) : code;
  // The sequence is always the last 4 digits of the base code.
  const seqStr = baseCode.slice(-4);
  return parseInt(seqStr, 10) + 1;
}

// export function generateInvoiceCode(
//   id: number,
//   type: "product" | "service",
//   date: Date = new Date()
// ) {
//   const year = date.getFullYear();
//   const month = (date.getMonth() + 1).toString().padStart(2, "0");
//   const formattedId = id.toString().padStart(4, "0");

//   const prefix = type === "product" ? "" : "S";

//   return `${prefix}${year}-${month}${formattedId}`;
// }

export function updateCodeVersion(code: string): string {
  // Split the ID by the dash
  const parts = code.split("-");

  if (parts.length > 2) {
    return code;
  }

  const baseId = parts[0];
  const currentVersion = parts[1];

  let newVersion = "R1";
  if (currentVersion) {
    const versionNumber = parseInt(currentVersion.slice(1), 10) + 1;
    newVersion = `R${versionNumber}`;
  }

  return `${baseId}-${newVersion}`;
}

export function getDateFormat(date: Date | string, format?: string) {
  if (typeof date === "string") {
    date = new Date(date);
  }
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  // if (!format) {
  // }
  return `${day}/${month}/${year}`;

  // return `${year}-${month}-${day}`;
}

export const debounce = <T extends unknown[]>(
  func: (...args: T) => any,
  delay: number
) => {
  let timer: NodeJS.Timeout;
  return function (...args: T) {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

export const getPriceFormat = (price: number) => {
  return price.toLocaleString("th-TH", {
    style: "currency",
    currency: "THB",
  });
};
