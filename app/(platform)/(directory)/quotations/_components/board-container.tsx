"use client";
import React, { SyntheticEvent, useEffect, useState } from "react";
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
import { FormInput } from "@/components/form/form-input";
import { useSearchParams } from "next/navigation";
import { quotationStatusMapping } from "@/app/config";
import { Files, Paperclip, Receipt } from "lucide-react";

interface Props {}

type QuotationWithCounts = QuotationWithBuyer & {
  _count: {
    purchaseOrders: number;
    medias: number;
    lists: number; // quotation list
  };
};

export default function BoardContainer(props: Props) {
  const allQuotationStatus = Object.values(QuotationStatus);
  const [searchParams, setSearchParams] = useState({
    code: "",
    buyer: "",
    vendor: "",
  });
  const queries = useQueries({
    queries: allQuotationStatus.map((quotationStatus) => {
      // combine quotationStatus and searchParams to create a unique queryKey
      const params = [
        "quotationKeys",
        quotationStatus,
        searchParams.code,
        searchParams.buyer,
        searchParams.vendor,
      ].join("-");
      return {
        queryKey: [params],
        exact: true,
        queryFn: () =>
          QT_SERVICES.get({
            status: quotationStatus,
            // dynamic query params from searchParams state
            code: searchParams.code,
            buyer: searchParams.buyer,
            vendor: searchParams.vendor,
          }),
      };
    }),
  });

  const invalidateQuotationQueries = () => {
    queryClient.invalidateQueries({
      predicate: (query) =>
        query.queryKey.every((key: any) => key.includes("quotationKeys")),
    });
  };

  useEffect(() => {
    // This function will invalidate queries related to quotations
    // whenever searchParams change
    invalidateQuotationQueries();
  }, [searchParams, queryClient]); // Dependency array includes searchParams to trigger effect when it changes

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
      // queryClient.invalidateQueries({
      //   predicate: (query) =>
      //     query.queryKey.every((key: any) =>
      //       invalidateKeys?.map((k) => "quotation-" + k).includes(key)
      //     ),
      // });
      invalidateQuotationQueries();

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

  const onSearch = (e: SyntheticEvent) => {
    e.preventDefault();
    // get all data
    const code = (e.target as any).code.value;
    const buyer = (e.target as any).buyer.value;
    const vendor = (e.target as any).vendor.value;
    console.log({
      code,
      buyer,
      vendor,
    });
    setSearchParams({
      code,
      buyer,
      vendor,
    });
  };

  return (
    <div className="">
      <BoardFilters onSubmit={onSearch} />
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
                label={quotationStatusMapping[QuotationStatus.open]}
              />
              <BoardColumn
                items={queries[1].data ?? ([] as QuotationWithBuyer[])}
                columnKey={QuotationStatus.offer}
                label={quotationStatusMapping[QuotationStatus.offer]}
              />
              <BoardColumn
                items={queries[2].data ?? ([] as QuotationWithBuyer[])}
                columnKey={QuotationStatus.approved}
                label={quotationStatusMapping[QuotationStatus.approved]}
              />
              <BoardColumn
                items={queries[3].data ?? ([] as QuotationWithBuyer[])}
                columnKey={QuotationStatus.po_preparing}
                label={quotationStatusMapping[QuotationStatus.po_preparing]}
              />
              <BoardColumn
                items={queries[4].data ?? ([] as QuotationWithBuyer[])}
                columnKey={QuotationStatus.po_sent}
                label={quotationStatusMapping[QuotationStatus.po_sent]}
              />
              <BoardColumn
                items={queries[5].data ?? ([] as QuotationWithBuyer[])}
                columnKey={QuotationStatus.product_received}
                label={quotationStatusMapping[QuotationStatus.product_received]}
              />
              <BoardColumn
                items={queries[6].data ?? ([] as QuotationWithBuyer[])}
                columnKey={QuotationStatus.order_preparing}
                label={quotationStatusMapping[QuotationStatus.order_preparing]}
              />
              <BoardColumn
                items={queries[7].data ?? ([] as QuotationWithBuyer[])}
                columnKey={QuotationStatus.delivered}
                label={quotationStatusMapping[QuotationStatus.delivered]}
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

type BoardFiltersProps = {
  onSubmit: (data: any) => void;
};

const BoardFilters = (props: BoardFiltersProps) => {
  const { onSubmit } = props;
  return (
    <div className="gap-x-2 mb-3 border border-gray-100  p-2  rounded-lg bg-gray-50 flex justify-end">
      <form onSubmit={onSubmit} className="grid grid-cols-4 gap-2">
        <FormInput id="code" type="search" placeholder="Code" />
        <FormInput id="buyer" type="search" placeholder="Buyer" />
        <FormInput id="vendor" type="search" placeholder="Vendor" />
        <button
          type="submit"
          className="col-span-1 bg-gray-100 rounded-md p-1.5 text-xs text-gray-600 font-semibold"
        >
          Search
        </button>
      </form>
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
  items: QuotationWithCounts[];
}) => {
  return (
    <div className="h-auto min-w-[210px] select-none">
      <div className="w-full rounded-md bg-gray-50 shadow-md pb-2 h-full">
        <div className="flex justify-between items-center px-3 pt-2 pb-4">
          <div className="text-sm font-semibold text-[#4a4a4a] whitespace-nowrap">
            {label}
          </div>
          <div className="text-xs font-semibold text-[#4a4a4a]">
            {items.length} รายการ
          </div>
        </div>
        <div className="h-full px-3">
          <Droppable droppableId={columnKey} type="card">
            {(provided) => (
              <ul
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="h-full"
              >
                {items.map((i: QuotationWithCounts, cardIdx) => {
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
  item: QuotationWithCounts;
}) => {
  return (
    <Draggable draggableId={idx.toString()} index={item.id}>
      {(provided) => (
        <li
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          className="w-full rounded-md bg-white shadow mb-3 cursor-move "
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
            {/* <div className="">
              
            </div> */}
          </div>
          <div className="bg-gray-50 flex justify-between items-center px-2">
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

            <div className="flex  space-x-2">
              {/* PO */}
              {item?._count?.purchaseOrders > 0 && (
                <div className="flex items-center my-1" title="PO">
                  <Receipt className="w-3 h-3  text-orange-400" />
                  <span className="text-xs text-orange-400">
                    {item?._count?.purchaseOrders}
                  </span>
                </div>
              )}

              {/* files */}
              {item?._count?.medias > 0 && (
                <div className="flex items-center my-1" title="Files">
                  <Paperclip className="w-3 h-3  text-blue-400" />
                  <span className="text-xs text-blue-400">{item?._count?.medias}</span>
                </div>
              )}

              {/* lists */}
              {item?._count?.lists > 0 && (
                <div className="flex items-center my-1" title="Lists">
                  <Files className="w-3 h-3  text-green-700" />
                  <span className="text-xs text-green-700">
                    {item?._count?.lists}
                  </span>
                </div>
              )}
            </div>
          </div>
        </li>
      )}
    </Draggable>
  );
};
