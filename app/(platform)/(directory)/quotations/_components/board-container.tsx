"use client";
import React, { SyntheticEvent, useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { QuotationWithRelations } from "@/types";
import { QuotationStatus, QuotationType } from "@prisma/client";
import { useQueries, useMutation } from "@tanstack/react-query";
import {
  MutationResponseType,
  queryClient,
} from "@/components/providers/query-provider";
import { toast } from "sonner";
import QT_SERVICES from "@/app/services/api.quotation";
import Link from "next/link";
import { FormInput } from "@/components/form/form-input";
import { useSearchParams } from "next/navigation";
import { productTypeMapping, quotationStatusMapping } from "@/app/config";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardCheckIcon,
  FileIcon,
  Files,
  ListFilter,
  ListFilterIcon,
  LockIcon,
  Paperclip,
  PlusIcon,
  Receipt,
  ReceiptIcon,
  UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuotationModal } from "@/hooks/use-quotation-modal";
import { classNames, cn, getDateFormat } from "@/lib/utils";
import { Select } from "@/components/ui/select";
import { FormSelect } from "@/components/form/form-select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DotsVerticalIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";

interface Props { }

type QuotationWithCounts = QuotationWithRelations & {
  _count: {
    purchaseOrders: number;
    medias: number;
    lists: number; // quotation list
  };
};

export default function BoardContainer(props: Props) {
  const allQuotationStatus = Object.values(QuotationStatus);
  const { onOpen } = useQuotationModal();
  const router = useRouter();

  const [searchParams, setSearchParams] = useState({
    code: "",
    buyer: "",
    vendor: "",
    type: "all",
  });

  // Collapsed columns state with localStorage persistence
  const [collapsedColumns, setCollapsedColumns] = useState<Set<QuotationStatus>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('quotation-board-collapsed-columns');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return new Set(parsed);
        } catch (e) {
          return new Set();
        }
      }
    }
    return new Set();
  });

  // Save collapsed state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('quotation-board-collapsed-columns', JSON.stringify(Array.from(collapsedColumns)));
    }
  }, [collapsedColumns]);

  // Optimistic updates state
  const [optimisticUpdates, setOptimisticUpdates] = useState<{
    [key: string]: QuotationStatus;
  }>({});

  // Function to get items for each column with optimistic updates applied
  const getItemsForColumn = (columnStatus: QuotationStatus, originalItems: QuotationWithCounts[]): QuotationWithCounts[] => {
    // Start with original items, remove any that have been optimistically moved out
    let filteredItems = originalItems.filter(item => {
      const optimisticStatus = optimisticUpdates[item.id.toString()];
      return !optimisticStatus || optimisticStatus === columnStatus;
    });

    // Add items that have been optimistically moved into this column
    Object.entries(optimisticUpdates).forEach(([itemId, newStatus]) => {
      if (newStatus === columnStatus) {
        // Find the item in any of the original query results
        const allItems = queries.flatMap(q => q.data || []);
        const movedItem = allItems.find(item => item.id.toString() === itemId);
        if (movedItem && !filteredItems.find(item => item.id.toString() === itemId)) {
          filteredItems.push(movedItem);
        }
      }
    });

    return filteredItems;
  };

  const toggleColumnCollapse = (columnKey: QuotationStatus) => {
    setCollapsedColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(columnKey)) {
        newSet.delete(columnKey);
      } else {
        newSet.add(columnKey);
      }
      return newSet;
    });
  };
  const queries = useQueries({
    queries: allQuotationStatus.map((quotationStatus) => {
      // combine quotationStatus and searchParams to create a unique queryKey
      const params = [
        "quotationKeys",
        quotationStatus,
        searchParams.code,
        searchParams.buyer,
        searchParams.vendor,
        searchParams.type,
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
            type: searchParams.type,
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
  }, [searchParams]); // Dependency array includes searchParams to trigger effect when it changes

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
      const quotationId = formData.id;
      const newStatus = formData.status;
      const res = await QT_SERVICES.put(quotationId, {
        status: newStatus,
      });
      return { ...res, invalidateKeys: formData.invalidateKeys };
    },
    onSuccess: async (n) => {
      const { invalidateKeys, ...res } = n;

      // Clear optimistic updates for this item
      const quotationId = res.data?.id?.toString();
      if (quotationId) {
        setOptimisticUpdates(prev => {
          const newUpdates = { ...prev };
          delete newUpdates[quotationId];
          return newUpdates;
        });
      }

      invalidateQuotationQueries();
      toast.success("Updated successfully");
      router.refresh();
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

    const newStatus = destination.droppableId as QuotationStatus;
    const quotationId = draggableId.split("-")[1]; // QT-1

    // Optimistic update - immediately update the UI
    setOptimisticUpdates(prev => ({
      ...prev,
      [quotationId]: newStatus
    }));

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
    const type = (e.target as any).type.value;

    // console.log({
    //   code,
    //   buyer,
    //   vendor,
    // });
    setSearchParams({
      code,
      buyer,
      vendor,
      type,
    });
  };

  return (
    <div className="">
      <div className="flex justify-between items-center">
        {/* <div className="">
          <Button onClick={onOpen} variant={"default"}>
            <PlusIcon className="w-4 h-4 mr-1 text-white" />
            QT ใหม่
          </Button>
        </div> */}
        <BoardFilters onCreate={onOpen} onSubmit={onSearch} />
      </div>
      <TooltipProvider>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="lists" type="list">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="flex gap-x-3 h-[calc(100vh-165px)] "
              >
                <BoardColumn
                  color="gray"
                  items={getItemsForColumn(QuotationStatus.open, queries[0].data ?? [])}
                  columnKey={QuotationStatus.open}
                  label={quotationStatusMapping[QuotationStatus.open].label}
                  progress={quotationStatusMapping[QuotationStatus.open].progress}
                  isCollapsed={collapsedColumns.has(QuotationStatus.open)}
                  onToggleCollapse={() => toggleColumnCollapse(QuotationStatus.open)}
                />
                <BoardColumn
                  color="yellow"
                  items={getItemsForColumn(QuotationStatus.pending_approval, queries[1].data ?? [])}
                  columnKey={QuotationStatus.pending_approval}
                  label={
                    quotationStatusMapping[QuotationStatus.pending_approval].label
                  }
                  progress={
                    quotationStatusMapping[QuotationStatus.pending_approval]
                      .progress
                  }
                  isCollapsed={collapsedColumns.has(QuotationStatus.pending_approval)}
                  onToggleCollapse={() => toggleColumnCollapse(QuotationStatus.pending_approval)}
                />
                <BoardColumn
                  color="gray"
                  items={getItemsForColumn(QuotationStatus.offer, queries[2].data ?? [])}
                  columnKey={QuotationStatus.offer}
                  label={quotationStatusMapping[QuotationStatus.offer].label}
                  progress={
                    quotationStatusMapping[QuotationStatus.offer].progress
                  }
                  isCollapsed={collapsedColumns.has(QuotationStatus.offer)}
                  onToggleCollapse={() => toggleColumnCollapse(QuotationStatus.offer)}
                />
                <BoardColumn
                  color="yellow"
                  items={getItemsForColumn(QuotationStatus.approved, queries[3].data ?? [])}
                  columnKey={QuotationStatus.approved}
                  label={quotationStatusMapping[QuotationStatus.approved].label}
                  progress={
                    quotationStatusMapping[QuotationStatus.approved].progress
                  }
                  isCollapsed={collapsedColumns.has(QuotationStatus.approved)}
                  onToggleCollapse={() => toggleColumnCollapse(QuotationStatus.approved)}
                />
                <BoardColumn
                  items={getItemsForColumn(QuotationStatus.po_preparing, queries[4].data ?? [])}
                  columnKey={QuotationStatus.po_preparing}
                  label={
                    quotationStatusMapping[QuotationStatus.po_preparing].label
                  }
                  progress={
                    quotationStatusMapping[QuotationStatus.po_preparing].progress
                  }
                  isCollapsed={collapsedColumns.has(QuotationStatus.po_preparing)}
                  onToggleCollapse={() => toggleColumnCollapse(QuotationStatus.po_preparing)}
                />
                <BoardColumn
                  items={getItemsForColumn(QuotationStatus.po_sent, queries[5].data ?? [])}
                  columnKey={QuotationStatus.po_sent}
                  label={quotationStatusMapping[QuotationStatus.po_sent].label}
                  progress={
                    quotationStatusMapping[QuotationStatus.po_sent].progress
                  }
                  isCollapsed={collapsedColumns.has(QuotationStatus.po_sent)}
                  onToggleCollapse={() => toggleColumnCollapse(QuotationStatus.po_sent)}
                />
                <BoardColumn
                  items={getItemsForColumn(QuotationStatus.product_received, queries[6].data ?? [])}
                  columnKey={QuotationStatus.product_received}
                  label={
                    quotationStatusMapping[QuotationStatus.product_received].label
                  }
                  progress={
                    quotationStatusMapping[QuotationStatus.product_received]
                      .progress
                  }
                  isCollapsed={collapsedColumns.has(QuotationStatus.product_received)}
                  onToggleCollapse={() => toggleColumnCollapse(QuotationStatus.product_received)}
                />
                <BoardColumn
                  items={getItemsForColumn(QuotationStatus.order_preparing, queries[7].data ?? [])}
                  columnKey={QuotationStatus.order_preparing}
                  label={
                    quotationStatusMapping[QuotationStatus.order_preparing].label
                  }
                  progress={
                    quotationStatusMapping[QuotationStatus.order_preparing]
                      .progress
                  }
                  isCollapsed={collapsedColumns.has(QuotationStatus.order_preparing)}
                  onToggleCollapse={() => toggleColumnCollapse(QuotationStatus.order_preparing)}
                />
                <BoardColumn
                  color="yellow"
                  items={getItemsForColumn(QuotationStatus.delivered, queries[8].data ?? [])}
                  columnKey={QuotationStatus.delivered}
                  label={quotationStatusMapping[QuotationStatus.delivered].label}
                  progress={
                    quotationStatusMapping[QuotationStatus.delivered].progress
                  }
                  isCollapsed={collapsedColumns.has(QuotationStatus.delivered)}
                  onToggleCollapse={() => toggleColumnCollapse(QuotationStatus.delivered)}
                />

                <BoardColumn
                  color="yellow"
                  items={getItemsForColumn(QuotationStatus.installment, queries[11].data ?? [])}
                  columnKey={QuotationStatus.installment}
                  label={quotationStatusMapping[QuotationStatus.installment].label}
                  progress={quotationStatusMapping[QuotationStatus.installment].progress}
                  isCollapsed={collapsedColumns.has(QuotationStatus.installment)}
                  onToggleCollapse={() => toggleColumnCollapse(QuotationStatus.installment)}
                />
                <BoardColumn
                  color="green"
                  items={getItemsForColumn(QuotationStatus.paid, queries[9].data ?? [])}
                  columnKey={QuotationStatus.paid}
                  label={quotationStatusMapping[QuotationStatus.paid].label}
                  progress={quotationStatusMapping[QuotationStatus.paid].progress}
                  isCollapsed={collapsedColumns.has(QuotationStatus.paid)}
                  onToggleCollapse={() => toggleColumnCollapse(QuotationStatus.paid)}
                />
                <BoardColumn
                  color="gray"
                  items={getItemsForColumn(QuotationStatus.archived, queries[10].data ?? [])}
                  columnKey={QuotationStatus.archived}
                  label={quotationStatusMapping[QuotationStatus.archived].label}
                  progress={
                    quotationStatusMapping[QuotationStatus.archived].progress
                  }
                  isCollapsed={collapsedColumns.has(QuotationStatus.archived)}
                  onToggleCollapse={() => toggleColumnCollapse(QuotationStatus.archived)}
                />
                {provided.placeholder}
                <div className="flex-shrink-0 w-1" />
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </TooltipProvider>
    </div>
  );
}

type BoardFiltersProps = {
  onCreate: () => void;
  onSubmit: (data: any) => void;
};

const BoardFilters = (props: BoardFiltersProps) => {
  const { onCreate, onSubmit } = props;
  return (
    <div className="gap-x-2 mb-3 border border-gray-100  p-2  rounded-lg bg-gray-50 flex justify-end">
      <form onSubmit={onSubmit} className="grid grid-cols-7 gap-2 items-center">
        <Button
          variant={"default"}
          onClick={onCreate}
          className="p-2 h-auto"
          type="button"
        >
          <PlusIcon className="w-4 h-4 text-white " />
          <p className="hidden lg:block  ml-1">Quotation</p>
        </Button>

        <div className="w-full ">
          <ListFilterIcon className="w-4 h-4 text-gray-600 ml-auto" />
        </div>
        <div className="w-full">
          <FormSelect
            id="type"
            className="w-full"
            defaultValue="all"
            options={[
              { id: "all", title: "ทุกประเภท" },
              { id: "product", title: "เฉพาะสินค้า" },
              { id: "service", title: "เฉพาะบริการ" },
            ]}
          />
        </div>

        <FormInput id="code" type="search" placeholder="รหัส" />
        <FormInput id="buyer" type="search" placeholder="ชื่อลูกค้า" />
        <FormInput id="vendor" type="search" placeholder="ชื่อผู้ขาย/ร้านค้า" />
        <div className=" w-full h-full ">
          <button
            type="submit"
            className="col-span-1 bg-gray-200 rounded-md  text-xs text-gray-600 font-semibold  h-full w-full"
          >
            ค้นหา
          </button>
        </div>
      </form>
    </div>
  );
};

const BoardColumn = ({
  items,
  columnKey,
  label,
  progress,
  color,
  isCollapsed,
  onToggleCollapse,
}: {
  columnKey: QuotationStatus;
  label: string;
  items: QuotationWithCounts[];
  progress: number;
  color?: "yellow" | "green" | "gray";
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}) => {
  if (isCollapsed) {
    return (
      <div className="h-full min-w-[50px] max-w-[80px] w-[80px] select-none border-primary/10 border">
        <Droppable droppableId={columnKey} type="card">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="h-full"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={classNames(
                      "w-full rounded-md shadow-md pb-2 h-full bg-secondary relative cursor-pointer transition-colors duration-200",
                      snapshot.isDraggingOver && "bg-blue-100 border-2 border-stone-400 shadow-lg"
                    )}
                    onClick={onToggleCollapse}
                  >
                    <div
                      className={cn(
                        "absolute h-1 right-0 left-0 top-0 bg-primary",
                        color === "yellow" && "bg-orange-400",
                        color === "green" && "bg-green-600",
                        color === "gray" && "bg-gray-400"
                      )}
                    ></div>
                    <div className="flex flex-col items-center justify-center h-full p-2">
                      <div className="transform -rotate-90 whitespace-nowrap text-sm font-semibold text-[#4a4a4a] mb-4">
                        {label} ({items.length})
                      </div>
                      <ChevronRightIcon className="w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{label} ({items.length} items)</p>
                </TooltipContent>
              </Tooltip>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    );
  }

  return (
    <div className="h-full min-w-[260px] select-none border-primary/10 border">
      <div
        className={classNames(
          "w-full rounded-md  shadow-md pb-2 h-full bg-secondary relative"
          // color === "yellow" && "bg-yellow-50",
          // color === "green" && "bg-green-50",
        )}
      >
        <div
          className={cn(
            "absolute h-1 right-0 left-0 top-0 bg-primary",
            color === "yellow" && "bg-orange-400",
            color === "green" && "bg-green-600",
            color === "gray" && "bg-gray-400"
          )}
        ></div>
        <div className="flex justify-between items-center px-3 py-4 bg-secondary border-b border-dotted">
          <div className="">
            <p className="text-sm font-semibold text-[#4a4a4a] whitespace-nowrap w-[180px] truncate">
              {label}
            </p>
            {label === quotationStatusMapping.archived.label ? (
              <p className="text-xs text-[#4a4a4a]">ข้อมูลที่เก็บไว้</p>
            ) : (
              <p className="text-xs text-[#4a4a4a]">ความคืบหน้า {progress}%</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs font-semibold text-[#4a4a4a]">
              ({items.length})
            </div>
            <button
              onClick={onToggleCollapse}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Collapse column"
            >
              <ChevronLeftIcon className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
        <div className=" h-[calc(100%-70px)] p-3 overflow-auto">
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

  const firstList = item.lists?.[0];
  const quotationInvoice = item.invoices?.length ? item.invoices[0] : null;
  return (
    <Draggable draggableId={idx.toString()} index={item.id}>
      {(provided) => (
        <li
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          className="w-full rounded-md bg-white shadow mb-3 cursor-move"
        >
          <div className="p-2 text-xs">
            <div className="flex space-x-1 justify-between  ">
              <Link
                href={`/quotations/${item.id}`}
                className={classNames(
                  "inline-flex items-center capitalize rounded bg-gray-100  py-0.5 text-xs font-medium text-gray-700 underline"
                  // item.type === QuotationType.product
                  //   ? "bg-white"
                  //   : "bg-green-100"
                )}
              >
                {/* {item.isLocked && (
                    <LockIcon className="w-3 h-3 mr-1 text-gray-500" />
                  )} */}
                <span>{item.code}</span>
              </Link>
              <div className="flex items-center">
                <span className="inline-flex items-center capitalize rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600">
                  {productTypeMapping[item.type]}
                </span>
                <MoreAction id={item.id} status={item.status} />
              </div>
            </div>
            {/* <p className=" text-slate-700 capitalize">{item.paymentType}</p> */}

            <div className="font-medium text-slate-900 my-2 line-clamp-1" title={item.contact?.name}>
              {item.contact?.name || ""}
            </div>
            {
              firstList && (
                <div className="text-xs text-gray-600 border-dashed p-1 border border-gray-400 ">
                  {
                    firstList.groupName && (
                      <p className="line-clamp-1 text-orange-400" title={firstList.groupName}
                      >{firstList.groupName}</p>
                    )
                  }
                  <p className="text-xs text-gray-500 line-clamp-1" title={firstList.name}>
                    {firstList.name || ""}
                  </p>
                </div>
              )
            }
            {/* <div className="font-medium text-slate-900 mt-2 flex items-center space-x-2">
              <p>สร้างโดย</p>
              <p className="font-medium text-slate-900 ">
                {item.seller?.name || ""}
              </p>
              <p>
                {new Date(item.createdAt).toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })}
              </p>
            </div> */}
            {/* <div className="">
              
            </div> */}
          </div>
          <div className="bg-gray-50 flex justify-between items-center px-2 py-1">
            <div className=" text-slate-900 text-xs flex items-center space-x-1 ">
              <UserIcon className="w-3 h-3  text-gray-500" />
              <span>{item.seller?.name || ""}</span>
            </div>

            <div className="flex  space-x-2">
              {/* PO */}
              {item?._count?.purchaseOrders > 0 && (
                <div className="flex items-center my-1" title="PO">
                  <FileIcon className="w-3 h-3  text-orange-400" />
                  <span className="text-xs text-orange-400">
                    {item?._count?.purchaseOrders}
                  </span>
                </div>
              )}

              {/* files */}
              {item?._count?.medias > 0 && (
                <div className="flex items-center my-1" title="Files">
                  <Paperclip className="w-3 h-3  text-blue-400" />
                  <span className="text-xs text-blue-400">
                    {item?._count?.medias}
                  </span>
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
          {quotationInvoice?.code && (
            <div className=" flex  items-center gap-1 px-2 py-1 text-orange-700 justify-between">
              <div className="flex space-x-1">
                <ReceiptIcon className="size-3.5 " />
                <span className="text-xs font-medium">ใบแจ้งหนี้</span>
              </div>
              <p
                className="text-xs"
                title={getDateFormat(quotationInvoice?.date ?? "")}
              >
                {" "}
                {quotationInvoice?.code}
              </p>
            </div>
          )}
          {quotationInvoice?.receiptCode && (
            <div className=" flex  items-center gap-1 px-2 py-1 text-green-700 justify-between">
              <div className="flex space-x-1">
                <ClipboardCheckIcon className="size-3.5 " />
                <span className="text-xs font-medium">ใบเสร็จ</span>
              </div>
              <p
                className="text-xs"
                title={getDateFormat(quotationInvoice?.receiptDate ?? "")}
              >
                {" "}
                {quotationInvoice?.receiptCode}
              </p>
            </div>
          )}
        </li>
      )}
    </Draggable>
  );
};


const MoreAction = ({ id, status }: { id: number; status: QuotationStatus; }) => {
  const router = useRouter();
  const { mutate: archive, isPending: isArchiving } = useMutation<MutationResponseType, Error, void>({
    mutationFn: async () => {
      return QT_SERVICES.put(id, { status: QuotationStatus.archived });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.every((key: any) => key.includes('quotationKeys')),
      });
      toast.success('Archived');
      router.refresh();
    },
    onError: () => {
      toast.error('Archive failed');
    }
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger disabled={isArchiving}>
        <DotsVerticalIcon className="w-4 h-4  ml-1 cursor-pointer" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {status !== QuotationStatus.archived ? (
          <DropdownMenuItem
            onSelect={(e) => { e.preventDefault(); archive(); }}
            disabled={isArchiving}
          >
            {isArchiving ? 'Archiving...' : 'Archive'}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuLabel className="text-xs text-gray-400">Archived</DropdownMenuLabel>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}