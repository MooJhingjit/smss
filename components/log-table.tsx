"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AuditLog } from "@prisma/client";
import { format } from "date-fns";
import { DiffViewer } from "./diff-viewer";

interface LogTableProps {
  logs: (AuditLog & { user: { name: string } | null })[];
}

export function LogTable({ logs }: LogTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table className="w-full">
        <TableHeader>
          <TableRow className="bg-gray-50 hover:bg-gray-50/80">
            <TableCell className="whitespace-nowrap pr-4 font-semibold text-gray-700 ">
              Timestamp
            </TableCell>
            <TableCell className="whitespace-nowrap pr-4 font-semibold text-gray-700 ">User</TableCell>
            <TableCell className="whitespace-nowrap pr-4 font-semibold text-gray-700">
              Action
            </TableCell>
            <TableCell className="whitespace-nowrap pr-4 font-semibold text-gray-700">
              Model Record ID
            </TableCell>
            <TableCell className="whitespace-nowrap pr-4 font-semibold text-gray-700">
              Changes
            </TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id} className="border-b">
              <TableCell className="font-medium text-gray-700">
                {format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss")}
              </TableCell>
              <TableCell>{log.user?.name ?? "System"}</TableCell>
              <TableCell>{log.action}</TableCell>
              <TableCell>{log.recordId}</TableCell>
              <TableCell>
                <DiffViewer diff={log.diff} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
