"use client";
import React, { useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

type WithKey = {
  id?: number;
  [key: string]: any; // This line allows any string to be used as a key
};

type Column<T> = {
  name: string;
  key: string;
  render?: (item: T) => React.ReactNode;
};

type Props<T> = {
  data: T[];
  columns: any;
  onManage?: (item: T) => void;
  link?: string;
};
export default function TableLists<T>(props: Readonly<Props<T>>) {
  const { data, columns, onManage, link } = props;

  const getFormatValue = useCallback(
    (item: any, column: Column<T>, rowIndex: number) => {
      const { key, render } = column;

      // Use render function if defined
      if (render) {
        return render(item);
      }

      // Handle special case for 'index'
      if (key === "index") {
        return rowIndex + 1;
      }

      // Get the value from the item using the key
      const value = item[key];

      // Process the value based on its type
      if (typeof value === "boolean") {
        return value ? "Yes" : "No";
      } else if (typeof value === "number") {
        return value.toLocaleString();
      }

      // Default return for other types
      return value;
    },
    []
  );

  return (
    <Table className="min-w-full divide-y divide-gray-300">
      <TableHeader className="">
        <TableRow>
          {link && (
            <TableHead
              key="link"
              className="px-3 py-3 text-left text-sm font-semibold text-gray-900"
            >
            </TableHead>
          )}

          {columns.map((column: any) => (
            <TableHead
              key={column.key}
              className="px-3 py-3 text-left text-sm font-semibold text-gray-900"
            >
              {column.name}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody className="divide-y divide-gray-200 bg-white">
        {data.map((item: any, rowIdx) => (
          <TableRow key={item.id} className="hover:bg-gray-50">
            {link && (
              <TableCell className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500">
                <Link target="_blank" href={`${link}/${item.id}`} passHref>
                  <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                </Link>
              </TableCell>
            )}
            {columns.map((column: any) => (
              <TableCell
                key={column.key}
                className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500 capitalize"
              >
                {getFormatValue(item, column, rowIdx)}
              </TableCell>
            ))}

            {onManage && (
              <TableCell>
                <Button
                  onClick={() => onManage(item)}
                  variant="secondary"
                  className="text-xs h-6"
                >
                  จัดการ
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
