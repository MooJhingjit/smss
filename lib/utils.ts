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