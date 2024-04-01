import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function classNames(...classes: ClassValue[]) {
  return classes.filter(Boolean).join(" ");
}

export const codeLength = 6;
export function generateCode(id: number, prefix: "QT" | "PO") {
  return `${prefix}-${id.toString().padStart(codeLength, "0")}`;
}

export function getDateFormat(date: Date | string) {
  if (typeof date === "string") {
    date = new Date(date);
  }
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${year}-${month}-${day}`;
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
