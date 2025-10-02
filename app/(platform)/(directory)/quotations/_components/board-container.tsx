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
} from "@/components/ui/dropdown-menu";
import { DotsVerticalIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { CloneComponent, PrintQuotation } from "@/components/modals/modal-quotation-info";

interface Props {}

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

  // Pagination state - track page for each column
  const [columnPages, setColumnPages] = useState<
    Record<QuotationStatus, number>
  >(() => {
    return allQuotationStatus.reduce((acc, status) => {
      acc[status] = 0;
      return acc;
    }, {} as Record<QuotationStatus, number>);
  });

  // Store accumulated data for each column
  const [accumulatedData, setAccumulatedData] = useState<
    Record<QuotationStatus, QuotationWithCounts[]>
  >(() => {
    return allQuotationStatus.reduce((acc, status) => {
      acc[status] = [];
      return acc;
    }, {} as Record<QuotationStatus, QuotationWithCounts[]>);
  });

  const ITEMS_PER_PAGE = 50;

  // Collapsed columns state with localStorage persistence
  const [collapsedColumns, setCollapsedColumns] = useState<
    Set<QuotationStatus>
  >(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("quotation-board-collapsed-columns");
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
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "quotation-board-collapsed-columns",
        JSON.stringify(Array.from(collapsedColumns))
      );
    }
  }, [collapsedColumns]);

  // Optimistic updates state
  const [optimisticUpdates, setOptimisticUpdates] = useState<{
    [key: string]: QuotationStatus;
  }>({});

  // Function to get items for each column with optimistic updates applied
  const getItemsForColumn = (
    columnStatus: QuotationStatus,
    queryIndex: number
  ): { items: QuotationWithCounts[]; hasMore: boolean; total: number } => {
    const query = queries[queryIndex];
    const hasMore = query?.data?.pagination?.hasMore || false;
    const total = query?.data?.pagination?.total || 0;

    // Use accumulated data instead of just current query data
    const baseItems = accumulatedData[columnStatus] || [];

    // Start with accumulated items, remove any that have been optimistically moved out
    let filteredItems = baseItems.filter((item: QuotationWithCounts) => {
      const optimisticStatus = optimisticUpdates[item.id.toString()];
      return !optimisticStatus || optimisticStatus === columnStatus;
    });

    // Add items that have been optimistically moved into this column
    Object.entries(optimisticUpdates).forEach(([itemId, newStatus]) => {
      if (newStatus === columnStatus) {
        // Find the item in any of the accumulated data
        const allItems = Object.values(accumulatedData).flat();
        const movedItem = allItems.find(
          (item: QuotationWithCounts) => item.id.toString() === itemId
        );
        if (
          movedItem &&
          !filteredItems.find(
            (item: QuotationWithCounts) => item.id.toString() === itemId
          )
        ) {
          filteredItems.push(movedItem);
        }
      }
    });

    return { items: filteredItems, hasMore, total };
  };

  // Track which columns are currently loading more data
  const [loadingColumns, setLoadingColumns] = useState<Set<QuotationStatus>>(
    new Set()
  );

  // Load more function for a specific column
  const loadMore = (columnStatus: QuotationStatus) => {
    setLoadingColumns((prev) => new Set(prev).add(columnStatus));
    setColumnPages((prev) => ({
      ...prev,
      [columnStatus]: prev[columnStatus] + 1,
    }));
  };

  const toggleColumnCollapse = (columnKey: QuotationStatus) => {
    setCollapsedColumns((prev) => {
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
      const currentPage = columnPages[quotationStatus];
      // combine quotationStatus and searchParams to create a unique queryKey
      const params = [
        "quotationKeys",
        quotationStatus,
        searchParams.code,
        searchParams.buyer,
        searchParams.vendor,
        searchParams.type,
        currentPage,
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
            skip: currentPage * ITEMS_PER_PAGE,
            take: ITEMS_PER_PAGE,
          }),
        staleTime: 1000 * 60 * 5, // 5 minutes
      };
    }),
  });

  // Update accumulated data when queries succeed
  useEffect(() => {
    queries.forEach((query, index) => {
      const status = allQuotationStatus[index];
      const currentPage = columnPages[status];

      if (query.data?.data && !query.isLoading) {
        setAccumulatedData((prev) => {
          const newData = { ...prev };

          // If page is 0, replace data; otherwise, append
          if (currentPage === 0) {
            newData[status] = query.data.data;
          } else {
            // Append new data, avoiding duplicates
            const existingIds = new Set(
              prev[status].map((item: QuotationWithCounts) => item.id)
            );
            const newItems = query.data.data.filter(
              (item: QuotationWithCounts) => !existingIds.has(item.id)
            );
            newData[status] = [...prev[status], ...newItems];
          }

          return newData;
        });

        // Remove from loading set when data is loaded
        setLoadingColumns((prev) => {
          const newSet = new Set(prev);
          newSet.delete(status);
          return newSet;
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queries.map((q) => q.data).join(",")]);

  const invalidateQuotationQueries = () => {
    queryClient.invalidateQueries({
      predicate: (query) =>
        query.queryKey.every((key: any) => key.includes("quotationKeys")),
    });
  };

  useEffect(() => {
    // This function will invalidate queries related to quotations
    // whenever searchParams change
    // Also reset pagination when search params change
    setColumnPages(
      allQuotationStatus.reduce((acc, status) => {
        acc[status] = 0;
        return acc;
      }, {} as Record<QuotationStatus, number>)
    );
    invalidateQuotationQueries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        setOptimisticUpdates((prev) => {
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
    setOptimisticUpdates((prev) => ({
      ...prev,
      [quotationId]: newStatus,
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
                  items={getItemsForColumn(QuotationStatus.open, 0).items}
                  columnKey={QuotationStatus.open}
                  label={quotationStatusMapping[QuotationStatus.open].label}
                  progress={
                    quotationStatusMapping[QuotationStatus.open].progress
                  }
                  isCollapsed={collapsedColumns.has(QuotationStatus.open)}
                  onToggleCollapse={() =>
                    toggleColumnCollapse(QuotationStatus.open)
                  }
                  hasMore={getItemsForColumn(QuotationStatus.open, 0).hasMore}
                  onLoadMore={() => loadMore(QuotationStatus.open)}
                  isLoading={loadingColumns.has(QuotationStatus.open)}
                  totalCount={getItemsForColumn(QuotationStatus.open, 0).total}
                />
                <BoardColumn
                  color="yellow"
                  items={
                    getItemsForColumn(QuotationStatus.pending_approval, 1).items
                  }
                  columnKey={QuotationStatus.pending_approval}
                  label={
                    quotationStatusMapping[QuotationStatus.pending_approval]
                      .label
                  }
                  progress={
                    quotationStatusMapping[QuotationStatus.pending_approval]
                      .progress
                  }
                  isCollapsed={collapsedColumns.has(
                    QuotationStatus.pending_approval
                  )}
                  onToggleCollapse={() =>
                    toggleColumnCollapse(QuotationStatus.pending_approval)
                  }
                  hasMore={
                    getItemsForColumn(QuotationStatus.pending_approval, 1)
                      .hasMore
                  }
                  onLoadMore={() => loadMore(QuotationStatus.pending_approval)}
                  isLoading={loadingColumns.has(
                    QuotationStatus.pending_approval
                  )}
                  totalCount={
                    getItemsForColumn(QuotationStatus.pending_approval, 1).total
                  }
                />
                <BoardColumn
                  color="gray"
                  items={getItemsForColumn(QuotationStatus.offer, 2).items}
                  columnKey={QuotationStatus.offer}
                  label={quotationStatusMapping[QuotationStatus.offer].label}
                  progress={
                    quotationStatusMapping[QuotationStatus.offer].progress
                  }
                  isCollapsed={collapsedColumns.has(QuotationStatus.offer)}
                  onToggleCollapse={() =>
                    toggleColumnCollapse(QuotationStatus.offer)
                  }
                  hasMore={getItemsForColumn(QuotationStatus.offer, 2).hasMore}
                  onLoadMore={() => loadMore(QuotationStatus.offer)}
                  isLoading={loadingColumns.has(QuotationStatus.offer)}
                  totalCount={getItemsForColumn(QuotationStatus.offer, 2).total}
                />
                <BoardColumn
                  color="yellow"
                  items={getItemsForColumn(QuotationStatus.approved, 3).items}
                  columnKey={QuotationStatus.approved}
                  label={quotationStatusMapping[QuotationStatus.approved].label}
                  progress={
                    quotationStatusMapping[QuotationStatus.approved].progress
                  }
                  isCollapsed={collapsedColumns.has(QuotationStatus.approved)}
                  onToggleCollapse={() =>
                    toggleColumnCollapse(QuotationStatus.approved)
                  }
                  hasMore={
                    getItemsForColumn(QuotationStatus.approved, 3).hasMore
                  }
                  onLoadMore={() => loadMore(QuotationStatus.approved)}
                  isLoading={loadingColumns.has(QuotationStatus.approved)}
                  totalCount={
                    getItemsForColumn(QuotationStatus.approved, 3).total
                  }
                />
                <BoardColumn
                  items={
                    getItemsForColumn(QuotationStatus.po_preparing, 4).items
                  }
                  columnKey={QuotationStatus.po_preparing}
                  label={
                    quotationStatusMapping[QuotationStatus.po_preparing].label
                  }
                  progress={
                    quotationStatusMapping[QuotationStatus.po_preparing]
                      .progress
                  }
                  isCollapsed={collapsedColumns.has(
                    QuotationStatus.po_preparing
                  )}
                  onToggleCollapse={() =>
                    toggleColumnCollapse(QuotationStatus.po_preparing)
                  }
                  hasMore={
                    getItemsForColumn(QuotationStatus.po_preparing, 4).hasMore
                  }
                  onLoadMore={() => loadMore(QuotationStatus.po_preparing)}
                  isLoading={loadingColumns.has(QuotationStatus.po_preparing)}
                  totalCount={
                    getItemsForColumn(QuotationStatus.po_preparing, 4).total
                  }
                />
                <BoardColumn
                  items={getItemsForColumn(QuotationStatus.po_sent, 5).items}
                  columnKey={QuotationStatus.po_sent}
                  label={quotationStatusMapping[QuotationStatus.po_sent].label}
                  progress={
                    quotationStatusMapping[QuotationStatus.po_sent].progress
                  }
                  isCollapsed={collapsedColumns.has(QuotationStatus.po_sent)}
                  onToggleCollapse={() =>
                    toggleColumnCollapse(QuotationStatus.po_sent)
                  }
                  hasMore={
                    getItemsForColumn(QuotationStatus.po_sent, 5).hasMore
                  }
                  onLoadMore={() => loadMore(QuotationStatus.po_sent)}
                  isLoading={loadingColumns.has(QuotationStatus.po_sent)}
                  totalCount={
                    getItemsForColumn(QuotationStatus.po_sent, 5).total
                  }
                />
                <BoardColumn
                  items={
                    getItemsForColumn(QuotationStatus.product_received, 6).items
                  }
                  columnKey={QuotationStatus.product_received}
                  label={
                    quotationStatusMapping[QuotationStatus.product_received]
                      .label
                  }
                  progress={
                    quotationStatusMapping[QuotationStatus.product_received]
                      .progress
                  }
                  isCollapsed={collapsedColumns.has(
                    QuotationStatus.product_received
                  )}
                  onToggleCollapse={() =>
                    toggleColumnCollapse(QuotationStatus.product_received)
                  }
                  hasMore={
                    getItemsForColumn(QuotationStatus.product_received, 6)
                      .hasMore
                  }
                  onLoadMore={() => loadMore(QuotationStatus.product_received)}
                  isLoading={loadingColumns.has(
                    QuotationStatus.product_received
                  )}
                  totalCount={
                    getItemsForColumn(QuotationStatus.product_received, 6).total
                  }
                />
                <BoardColumn
                  items={
                    getItemsForColumn(QuotationStatus.order_preparing, 7).items
                  }
                  columnKey={QuotationStatus.order_preparing}
                  label={
                    quotationStatusMapping[QuotationStatus.order_preparing]
                      .label
                  }
                  progress={
                    quotationStatusMapping[QuotationStatus.order_preparing]
                      .progress
                  }
                  isCollapsed={collapsedColumns.has(
                    QuotationStatus.order_preparing
                  )}
                  onToggleCollapse={() =>
                    toggleColumnCollapse(QuotationStatus.order_preparing)
                  }
                  hasMore={
                    getItemsForColumn(QuotationStatus.order_preparing, 7)
                      .hasMore
                  }
                  onLoadMore={() => loadMore(QuotationStatus.order_preparing)}
                  isLoading={loadingColumns.has(
                    QuotationStatus.order_preparing
                  )}
                  totalCount={
                    getItemsForColumn(QuotationStatus.order_preparing, 7).total
                  }
                />
                <BoardColumn
                  color="yellow"
                  items={getItemsForColumn(QuotationStatus.delivered, 8).items}
                  columnKey={QuotationStatus.delivered}
                  label={
                    quotationStatusMapping[QuotationStatus.delivered].label
                  }
                  progress={
                    quotationStatusMapping[QuotationStatus.delivered].progress
                  }
                  isCollapsed={collapsedColumns.has(QuotationStatus.delivered)}
                  onToggleCollapse={() =>
                    toggleColumnCollapse(QuotationStatus.delivered)
                  }
                  hasMore={
                    getItemsForColumn(QuotationStatus.delivered, 8).hasMore
                  }
                  onLoadMore={() => loadMore(QuotationStatus.delivered)}
                  isLoading={loadingColumns.has(QuotationStatus.delivered)}
                  totalCount={
                    getItemsForColumn(QuotationStatus.delivered, 8).total
                  }
                />

                <BoardColumn
                  color="yellow"
                  items={
                    getItemsForColumn(QuotationStatus.installment, 11).items
                  }
                  columnKey={QuotationStatus.installment}
                  label={
                    quotationStatusMapping[QuotationStatus.installment].label
                  }
                  progress={
                    quotationStatusMapping[QuotationStatus.installment].progress
                  }
                  isCollapsed={collapsedColumns.has(
                    QuotationStatus.installment
                  )}
                  onToggleCollapse={() =>
                    toggleColumnCollapse(QuotationStatus.installment)
                  }
                  hasMore={
                    getItemsForColumn(QuotationStatus.installment, 11).hasMore
                  }
                  onLoadMore={() => loadMore(QuotationStatus.installment)}
                  isLoading={loadingColumns.has(QuotationStatus.installment)}
                  totalCount={
                    getItemsForColumn(QuotationStatus.installment, 11).total
                  }
                />
                <BoardColumn
                  color="green"
                  items={getItemsForColumn(QuotationStatus.paid, 9).items}
                  columnKey={QuotationStatus.paid}
                  label={quotationStatusMapping[QuotationStatus.paid].label}
                  progress={
                    quotationStatusMapping[QuotationStatus.paid].progress
                  }
                  isCollapsed={collapsedColumns.has(QuotationStatus.paid)}
                  onToggleCollapse={() =>
                    toggleColumnCollapse(QuotationStatus.paid)
                  }
                  hasMore={getItemsForColumn(QuotationStatus.paid, 9).hasMore}
                  onLoadMore={() => loadMore(QuotationStatus.paid)}
                  isLoading={loadingColumns.has(QuotationStatus.paid)}
                  totalCount={getItemsForColumn(QuotationStatus.paid, 9).total}
                />
                <BoardColumn
                  color="gray"
                  items={getItemsForColumn(QuotationStatus.archived, 10).items}
                  columnKey={QuotationStatus.archived}
                  label={quotationStatusMapping[QuotationStatus.archived].label}
                  progress={
                    quotationStatusMapping[QuotationStatus.archived].progress
                  }
                  isCollapsed={collapsedColumns.has(QuotationStatus.archived)}
                  onToggleCollapse={() =>
                    toggleColumnCollapse(QuotationStatus.archived)
                  }
                  hasMore={
                    getItemsForColumn(QuotationStatus.archived, 10).hasMore
                  }
                  onLoadMore={() => loadMore(QuotationStatus.archived)}
                  isLoading={loadingColumns.has(QuotationStatus.archived)}
                  totalCount={
                    getItemsForColumn(QuotationStatus.archived, 10).total
                  }
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
  hasMore,
  onLoadMore,
  isLoading,
  totalCount,
}: {
  columnKey: QuotationStatus;
  label: string;
  items: QuotationWithCounts[];
  progress: number;
  color?: "yellow" | "green" | "gray";
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  hasMore: boolean;
  onLoadMore: () => void;
  isLoading?: boolean;
  totalCount: number;
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
                      snapshot.isDraggingOver &&
                        "bg-blue-100 border-2 border-stone-400 shadow-lg"
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
                        {/* {label} ({items.length}/{totalCount}) */}
                        {label} ({totalCount})
                      </div>
                      <ChevronRightIcon className="w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {label} ({items.length}/{totalCount} items)
                  </p>
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
              ({totalCount}){/* ({items.length}/{totalCount}) */}
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
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="h-full flex flex-col"
              >
                <ul className="flex-1">
                  {items.map((i: QuotationWithCounts, cardIdx) => {
                    return <BoardCard idx={`QT-${i.id}`} key={i.id} item={i} />;
                  })}

                  {provided.placeholder}
                </ul>
                {hasMore && (
                  <div className="mt-2 flex justify-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={onLoadMore}
                      disabled={isLoading}
                      className="w-full text-xs"
                    >
                      {isLoading ? "กำลังโหลด..." : "โหลดเพิ่มเติม"}
                    </Button>
                  </div>
                )}
              </div>
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
                <MoreAction
                  quotation={item}
                />
              </div>
            </div>
            {/* <p className=" text-slate-700 capitalize">{item.paymentType}</p> */}

            <div
              className="font-medium text-slate-900 my-2 line-clamp-1"
              title={item.contact?.name}
            >
              {item.contact?.name || ""}
            </div>
            {firstList && (
              <div className="text-xs text-gray-600 border-dashed p-1 border border-gray-400 ">
                {firstList.groupName && (
                  <p
                    className="line-clamp-1 text-orange-400"
                    title={firstList.groupName}
                  >
                    {firstList.groupName}
                  </p>
                )}
                <p
                  className="text-xs text-gray-500 line-clamp-1"
                  title={firstList.name}
                >
                  {firstList.name || ""}
                </p>
              </div>
            )}
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

const MoreAction = ({
  quotation
}: {
  quotation: QuotationWithCounts;

}) => {
  console.log("🚀 ~ MoreAction ~ quotation:", quotation)
  const { id, status, approvedAt } = quotation;

  const router = useRouter();
  const { mutate: archive, isPending: isArchiving } = useMutation<
    MutationResponseType,
    Error,
    void
  >({
    mutationFn: async () => {
      return QT_SERVICES.put(id, { status: QuotationStatus.archived });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey.every((key: any) => key.includes("quotationKeys")),
      });
      toast.success("Archived");
      router.refresh();
    },
    onError: () => {
      toast.error("Archive failed");
    },
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger disabled={isArchiving}>
        <DotsVerticalIcon className="w-4 h-4  ml-1 cursor-pointer" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {status !== QuotationStatus.archived ? (
          <DropdownMenuItem
            className="pl-4"
            onSelect={(e) => {
              e.preventDefault();
              archive();
            }}
            disabled={isArchiving}
          >
            {isArchiving ? "Archiving..." : "Archive"}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuLabel className="text-xs text-gray-400">
            Archived
          </DropdownMenuLabel>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <div className="">
            <DropdownMenuLabel className="text-sm text-gray-500 font-normal">
              Print Quotation
            </DropdownMenuLabel>
            <PrintQuotation
              quotationId={id}
              defaultDate={approvedAt? new Date(approvedAt) : new Date()}
            />
          </div>
        </DropdownMenuItem>
        {/* <DropdownMenuSeparator />
        <DropdownMenuItem>
          <CloneComponent
            quotation={quotation}
            onCloned={() => null }
          />
        </DropdownMenuItem> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
