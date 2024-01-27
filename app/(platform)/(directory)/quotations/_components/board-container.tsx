"use client";
import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { QuotationWithBuyer } from "@/types";
import { QuotationStatus } from "@prisma/client";
import { useQueries, useMutation } from "@tanstack/react-query";
import {
  MutationResponseType,
  queryClient,
} from "@/components/providers/query-provider";
import { toast } from "sonner";
import QT_SERVICES from "@/app/services/service.quotation";
import Link from "next/link";
interface Props {}

export default function BoardContainer(props: Props) {
  const allQuotationStatus = Object.values(QuotationStatus);

  const queries = useQueries({
    queries: allQuotationStatus.map((quotationStatus) => {
      return {
        queryKey: ["quotation-" + quotationStatus],
        exact: true,
        queryFn: () =>
          QT_SERVICES.get({
            status: quotationStatus,
          }),
      };
    }),
  });

  const { mutate } = useMutation<
    MutationResponseType,
    Error,
    {
      status: QuotationStatus;
      id: number;
      invalidateKeys: QuotationStatus[];
    }
  >({
    mutationFn: async (formData) => {
      console.log(formData);
      const quotationId = formData.id;
      const newStatus = formData.status;
      const res = await QT_SERVICES.put(quotationId, {
        status: newStatus,
      });
      return { ...res, invalidateKeys: formData.invalidateKeys };
    },
    onSuccess: async (n) => {
      const { invalidateKeys, ...res } = n;

      // invalidate all queries with the related status
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey.every((key: any) =>
            invalidateKeys?.map((k) => "quotation-" + k).includes(key)
          ),
      });

      toast.success("Updated successfully");
    },
  });

  const onDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    // if dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId;
    const quotationId = draggableId.split("-")[1]; // QT-1

    mutate({
      id: Number(quotationId),
      status: newStatus,
      invalidateKeys: [source.droppableId, destination.droppableId],
    });
  };

  return (
    <div className="">
      <BoardFilters />
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="lists" type="list">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex gap-x-3 h-full"
            >
              <BoardColumn
                items={queries[0].data ?? ([] as QuotationWithBuyer[])}
                columnKey={QuotationStatus.open}
                label="เปิด QT"
              />
              <BoardColumn
                items={queries[1].data ?? ([] as QuotationWithBuyer[])}
                columnKey={QuotationStatus.offer}
                label="ส่ง QT (ให้ลูกค้า)"
              />
              <BoardColumn
                items={queries[2].data ?? ([] as QuotationWithBuyer[])}
                columnKey={QuotationStatus.approved}
                label="อนุมัติ QT"
              />
              <BoardColumn
                items={queries[3].data ?? ([] as QuotationWithBuyer[])}
                columnKey={QuotationStatus.po_preparing}
                label="เตรียม PO (ผู้ขาย)"
              />
              <BoardColumn
                items={queries[4].data ?? ([] as QuotationWithBuyer[])}
                columnKey={QuotationStatus.po_sent}
                label="ส่ง PO (ผู้ขาย)"
              />
              <BoardColumn
                items={queries[5].data ?? ([] as QuotationWithBuyer[])}
                columnKey={QuotationStatus.product_received}
                label="รับสินค้า"
              />
              <BoardColumn
                items={queries[6].data ?? ([] as QuotationWithBuyer[])}
                columnKey={QuotationStatus.order_preparing}
                label="รอส่งสินค้า"
              />
              <BoardColumn
                items={queries[7].data ?? ([] as QuotationWithBuyer[])}
                columnKey={QuotationStatus.delivered}
                label="ส่งสินค้า / ปิดงาน"
              />
              {provided.placeholder}
              <div className="flex-shrink-0 w-1" />
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

const BoardFilters = () => {
  return (
    <div className="flex items-center gap-x-2 mb-3 border border-gray-100 text-gray-300 px-4 py-4 justify-center rounded-lg bg-gray-50">
      <p>Filter Area</p>
    </div>
  );
};

const BoardColumn = ({
  items,
  columnKey,
  label,
}: {
  columnKey: QuotationStatus;
  label: string;
  items: QuotationWithBuyer[];
}) => {
  return (
    <div className="h-auto min-w-[210px] select-none">
      <div className="w-full rounded-md bg-gray-50 shadow-md pb-2 h-full">
        <div className="flex justify-between items-center px-3 pt-2 pb-4">
          <div className="text-sm font-semibold text-[#4a4a4a] whitespace-nowrap">
            {label}
          </div>
          <div className="text-xs font-semibold text-[#4a4a4a]">0/0</div>
        </div>
        <div className="h-full px-3">
          <Droppable droppableId={columnKey} type="card">
            {(provided) => (
              <ul
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="h-full"
              >
                {items.map((i: QuotationWithBuyer, cardIdx) => {
                  return <BoardCard idx={`QT-${i.id}`} key={i.id} item={i} />;
                })}

                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </div>
      </div>
    </div>
  );
};

const BoardCard = ({
  idx,
  item,
}: {
  idx: string;
  item: QuotationWithBuyer;
}) => {
  return (
    <Draggable draggableId={idx.toString()} index={item.id}>
      {(provided) => (
        <li
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          className="w-full rounded-md bg-white shadow mb-3 "
        >
          <div className="p-2 text-xs">
            <div className="flex justify-between items-center">
              <div className="flex space-x-1">
                <Link
                  href={`/quotations/${item.id}`}
                  className="inline-flex items-center capitalize rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-700 underline"
                >
                  {item.code}
                </Link>
                {/* <span className="inline-flex items-center capitalize rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600">
                  {item.type}
                </span> */}
              </div>
              <p className=" text-slate-700 capitalize">{item.paymentType}</p>
            </div>

            <div className="flex justify-between mt-2">
              <div className="font-medium text-slate-900">
                {item.buyer.name}
              </div>
            </div>
            <div className="">
              <p className=" text-slate-700 capitalize text-xs">
                {/* display date in DD/MM/YYYY */}

                {new Date(item.createdAt).toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })}
              </p>
            </div>
          </div>
        </li>
      )}
    </Draggable>
  );
};
