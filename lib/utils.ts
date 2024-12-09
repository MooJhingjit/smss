import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function classNames(...classes: ClassValue[]) {
  return classes.filter(Boolean).join(" ");
}

export const codeLength = 6;

export function generateCode(id: number, prefix: "QT" | "PO", date: Date = new Date()) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const formattedId = id.toString().padStart(4, "0");

  return `${prefix}${year}${month}${formattedId}`;
}


export function generateInvoiceCode(id: number, type: 'product' | 'service', date: Date = new Date()) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const formattedId = id.toString().padStart(4, "0");

  const prefix = type === 'product' ? '' : 'S';

  return `${prefix}${year}-${month}${formattedId}`;
}

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
  delay: number,
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
}