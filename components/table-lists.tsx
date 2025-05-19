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
import { ExternalLink, GripVertical } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";

// type WithKey = {
//   id?: number;
//   [key: string]: any; // This line allows any string to be used as a key
// };

type Column<T> = {
  name: string;
  key: string;
  render?: (item: T) => React.ReactNode;
};

type Props<T> = {
  data: T[];
  columns: Column<T>[];
  onManage?: (item: T) => void;
  link?: string;
  onDropped?: (items: T[]) => void;
  showGroupNameAt?: string;
};
// Reusable component for table headers
const TableHeaders = <T,>({
  columns,
  onManage,
  link,
  showDragHandle
}: {
  columns: Column<T>[],
  onManage?: (item: T) => void,
  link?: string,
  showDragHandle?: boolean
}) => {
  return (
    <TableHeader className="">
      <TableRow>
        {showDragHandle && (
          <TableHead
            key="drag-handle"
            className="w-10 px-3 py-3 text-left text-sm font-semibold text-gray-900"
          ></TableHead>
        )}

        {onManage && (
          <TableHead
            key="manage"
            className="px-3 py-3 text-left text-sm font-semibold text-gray-900"
          ></TableHead>
        )}
        {link && (
          <TableHead
            key="link"
            className="px-3 py-3 text-left text-sm font-semibold text-gray-900"
          ></TableHead>
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
  );
};

// Reusable component for rendering a standard table row
const StandardTableRow = <T,>({
  item,
  rowIdx,
  onManage,
  link,
  columns,
  getFormatValue
}: {
  item: T,
  rowIdx: number,
  onManage?: (item: T) => void,
  link?: string,
  columns: Column<T>[],
  getFormatValue: (item: T, column: Column<T>, rowIndex: number) => React.ReactNode
}) => {
  return (
    <TableRow key={(item as any).id} className="hover:bg-gray-50">
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
      {link && (
        <TableCell className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500">
          <Link target="_blank" href={`${link}/${(item as any).id}`} passHref>
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
    </TableRow>
  );
};

// Standard table without drag and drop
const StandardTable = <T,>({
  data,
  columns,
  onManage,
  link,
  getFormatValue
}: {
  data: T[],
  columns: Column<T>[],
  onManage?: (item: T) => void,
  link?: string,
  getFormatValue: (item: T, column: Column<T>, rowIndex: number) => React.ReactNode
}) => {
  return (
    <Table className="min-w-full divide-y divide-gray-300">
      <TableHeaders
        columns={columns}
        onManage={onManage}
        link={link}
      />
      <TableBody className="divide-y divide-gray-100 bg-white">
        {data.map((item: any, rowIdx) => (
          <StandardTableRow
            key={(item as any).id}
            item={item}
            rowIdx={rowIdx}
            onManage={onManage}
            link={link}
            columns={columns}
            getFormatValue={getFormatValue}
          />
        ))}
      </TableBody>
    </Table>
  );
};

// Draggable table component, group name is for quotation list
const DraggableTable = <T extends { groupName?: string, hiddenInPdf?: boolean }>({
  data,
  columns,
  onManage,
  link,
  getFormatValue,
  handleDragEnd,
  showGroupNameAt
}: {
  data: T[],
  columns: Column<T>[],
  onManage?: (item: T) => void,
  link?: string,
  getFormatValue: (item: T, column: Column<T>, rowIndex: number) => React.ReactNode,
  handleDragEnd: (result: any) => void,
  showGroupNameAt?: string
}) => {

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Table className="min-w-full divide-y divide-gray-300">
        <TableHeaders
          columns={columns}
          onManage={onManage}
          link={link}
          showDragHandle={true}
        />
        <Droppable droppableId="table-rows">
          {(provided) => (
            <TableBody
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="divide-y divide-gray-100 bg-white"
            >
              {data.map((item: T, rowIdx) => (
                <Draggable
                  key={`draggable-${(item as any).id}`}
                  draggableId={`row-${(item as any).id}`}
                  index={rowIdx}
                >
                  {(provided, snapshot) => (
                    <TableRow
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={cn("hover:bg-gray-50", {
                        "bg-gray-100": snapshot.isDragging,
                        "border !border-t-black h-[] border-r-0 border-l-0": !!item.groupName,
                      })}

                    >
                      {/* Drag handle */}
                      <TableCell
                        className="w-10 py-2"
                      >
                        <div
                          className="flex justify-center"
                          {...provided.dragHandleProps}
                        >
                          <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                        </div>
                      </TableCell>

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
                      {link && (
                        <TableCell className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500">
                          <Link target="_blank" href={`${link}/${(item as any).id}`} passHref>
                            <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                          </Link>
                        </TableCell>
                      )}
                      {columns.map((column: any, index: number) => (
                        <TableCell
                          key={`${column.key}-${(item as any).id}`}
                          className={cn(
                            "whitespace-nowrap px-3 py-2.5 text-sm text-gray-500 capitalize relative", {
                            "text-gray-300": item.hiddenInPdf && column.key !== "index",
                          }

                          )}
                        >
                          {
                            showGroupNameAt && item.groupName && (column.key as string === showGroupNameAt) && (
                              <div className=" text-orange-400 underline absolute -top-2 left-1 text-xs bg-white px-2">
                                {item.groupName}
                              </div>
                            )}

                          {getFormatValue(item, column, rowIdx)}
                        </TableCell>
                      ))}
                    </TableRow>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </TableBody>
          )}
        </Droppable>
      </Table>
    </DragDropContext>
  );
};

export default function TableLists<T extends object>(props: Readonly<Props<T>>) {
  const { data, columns, onManage, link, onDropped, showGroupNameAt } = props;

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

  const handleDragEnd = (result: any) => {
    if (!onDropped) return;

    const { destination, source } = result;

    // If dropped outside the list or no change in position
    if (!destination || destination.index === source.index) {
      return;
    }

    // Create a new array from data
    const items = Array.from(data);
    // Remove the dragged item from its position
    const [reorderedItem] = items.splice(source.index, 1);
    // Insert the item at the new position
    items.splice(destination.index, 0, reorderedItem);

    // Call the callback with the new order
    onDropped(items);
  };

  if (data.length === 0) {
    return <TablePlaceholder />;
  }

  // Render the appropriate table based on whether drag-and-drop is enabled
  return onDropped ? (
    <DraggableTable
      data={data}
      showGroupNameAt={showGroupNameAt}
      columns={columns}
      onManage={onManage}
      link={link}
      getFormatValue={getFormatValue}
      handleDragEnd={handleDragEnd}
    />
  ) : (
    <StandardTable
      data={data}
      columns={columns}
      onManage={onManage}
      link={link}
      getFormatValue={getFormatValue}
    />
  );
}

const TablePlaceholder: React.FC = () => (
  <div className="text-center   h-full flex items-center justify-center">
    <p className="mt-10 text-muted-foreground">ไม่มีข้อมูล</p>
  </div>
);
