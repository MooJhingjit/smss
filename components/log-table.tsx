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
            <TableHead className="font-semibold text-gray-700">
              Timestamp
            </TableHead>
            <TableHead className="font-semibold text-gray-700">User</TableHead>
            <TableHead className="font-semibold text-gray-700">
              Action
            </TableHead>
            <TableHead className="font-semibold text-gray-700">
              Record ID
            </TableHead>
            <TableHead className="font-semibold text-gray-700">
              Changes
            </TableHead>
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
