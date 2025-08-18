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

export function getDateFormat2(date: Date | string, format?: string) {
  if (typeof date === "string") {
    date = new Date(date);
  }
  
  // Use UTC methods to get the date as stored in database (without timezone conversion)
  const day = date.getUTCDate().toString().padStart(2, "0");
  const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const year = date.getUTCFullYear();
  
  return `${day}/${month}/${year}`;
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
