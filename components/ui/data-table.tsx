"use client";
import React from "react";
import {
  Table as ITable,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
  ColumnFiltersState,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "./button";

import {
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Input } from "./input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onCreate?: () => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onCreate,
}: Readonly<DataTableProps<TData, TValue>>) {
  const [sorting, setSorting] = React.useState<SortingState>([])

  // const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
  //   [],
  // );
  const [globalFilter, setGlobalFilter] = React.useState("");

  // Process columns to add enableSorting: false by default if not specified
  const processedColumns = React.useMemo(() => {
    return columns.map(column => ({
      ...column,
      enableSorting: column.enableSorting ?? false // Set false as default if not explicitly set
    }));
  }, [columns]);

  const table = useReactTable({
    data,
    columns: processedColumns,
    // We enable sorting at the table level, but disable it by default at column level
    enableSorting: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    getPaginationRowModel: getPaginationRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter,
    },
    getColumnCanGlobalFilter: () => true,
  });

  return (
    <div className="">
      <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center mt-4 mb-2 space-y-2 sm:space-y-0">
        <div className="flex flex-1 w-full justify-end sm:justify-start">
          <DataTablePagination table={table} />
        </div>

        <div className="flex flex-1 w-full items-center space-x-2 justify-end ">
          <Input
            id="search"
            placeholder="ค้นหา"
            value={globalFilter}
            onChange={(e) => {
              setGlobalFilter(e.target.value);
            }}
            className="max-w-sm"
          />
          {onCreate && (
            <Button variant="secondary" className="h-[36px]" onClick={onCreate}>
              <Plus size={20} />
            </Button>
          )}
        </div>
      </div>
      <Table className="min-w-full divide-y divide-gray-300">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className="py-3.5 px-3  text-left text-sm font-semibold text-gray-900  "

                  >
                    <div className="flex items-center">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}

                      {/* Debug info - will show if the column can be sorted */}
                      {/* <span className="ml-2 text-xs text-blue-500">
                        {JSON.stringify({
                          enableSorting: header.column.columnDef.enableSorting,
                          canSort: header.column.getCanSort()
                        })}
                      </span> */}

                      {header.column.getCanSort() && (
                        <>
                          {header.column.getIsSorted() === 'desc' ? (
                            <span className="text-gray-400" onClick={header.column.getToggleSortingHandler()}>
                              <ChevronDown className="h-4 w-4 ml-2 cursor-pointer hover:text-gray-600 font-semibold" />
                            </span>
                          ) : header.column.getIsSorted() === 'asc' ? (
                            <span className="text-gray-400" onClick={header.column.getToggleSortingHandler()}>
                              <ChevronUp className="h-4 w-4 ml-2 cursor-pointer hover:text-gray-600 font-semibold" />
                            </span>
                          ) : (
                            <span className="text-gray-400" onClick={header.column.getToggleSortingHandler()}>
                              <ChevronUp className="h-4 w-4 ml-2 cursor-pointer hover:text-gray-600 font-semibold opacity-30" />
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className="divide-y divide-gray-200">
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      "whitespace-nowrap px-3 py-4 text-sm text-gray-500 max-w-52 truncate",
                      typeof cell.getValue() === "string" &&
                        globalFilter &&
                        String(cell.getValue()).toLowerCase().includes(globalFilter.toLowerCase())
                        ? "bg-yellow-50 text-black font-semibold"
                        : ""
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

interface DataTablePaginationProps<TData> {
  table: ITable<TData>;
}

function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          <span className="sr-only">Go to first page</span>
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <span className="sr-only">Go to previous page</span>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <span className="sr-only">Go to next page</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          <span className="sr-only">Go to last page</span>
          <ChevronsRight className="h-4 w-4" />
        </Button>
        <div className="flex items-center justify-center text-sm">
          {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {/* <p className="text-sm">Rows per page</p> */}
        <Select
          value={`${table.getState().pagination.pageSize}`}
          onValueChange={(value) => {
            table.setPageSize(Number(value));
          }}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={table.getState().pagination.pageSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <SelectItem key={pageSize} value={`${pageSize}`}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
