"use client";
import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Quotation } from "@prisma/client";
import { QuotationWithBuyer } from "@/types";

interface Props {
  data?: any;
}

export default function BoardContainer(props: Props) {
  const { data } = props;

  const onDragEnd = (result: any) => { };

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
              <BoardColumn label="Quotation Open" idx={1} items={data.pending} />
              <BoardColumn label="Quotation Sent" idx={2} items={[]} />
              <BoardColumn label="Quotation Approved" idx={3} items={[]} />
              <BoardColumn label="Order Sent" idx={4} items={[]} />
              <BoardColumn label="Order Received" idx={5} items={[]} />
              <BoardColumn label="Delivered/Done" idx={6} items={[]} />
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
  label,
  idx,
  items
}: {
  label: string;
  idx: number;
  items: QuotationWithBuyer[]
}) => {

  return (
    <div className="h-full min-w-[210px] select-none">
      <div className="w-full rounded-md bg-gray-50 shadow-md pb-2 h-full">
        <div className="flex justify-between items-center px-3 pt-2 pb-4">
          <div className="text-sm font-semibold text-[#4a4a4a] whitespace-nowrap">
            {label}
          </div>
          <div className="text-xs font-semibold text-[#4a4a4a]">0/0</div>
        </div>
        <div className="h-full px-3">
          <Droppable droppableId={`list-${idx}`} type="card">
            {(provided) => (
              <ul
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="h-full"
              >
                {items.map((i: QuotationWithBuyer, cardIdx) => {
                  return <BoardCard idx={`${idx}-${cardIdx}`} key={i.id} item={i} />;
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

const BoardCard = ({ idx, item }: { idx: string; item: QuotationWithBuyer }) => {
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
                <span className="inline-flex items-center capitalize rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-700">
                  {item.code}
                </span>
                {/* <span className="inline-flex items-center capitalize rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600">
                  {item.type}
                </span> */}
              </div>
              <p className=" text-slate-700 capitalize">{item.paymentType}</p>

            </div>

            <div className="flex justify-between mt-2">
              <div className="font-medium text-slate-900">{item.buyer.name}</div>
            </div>
            <div className="text-xs">
              <p className=" text-slate-700"><span className="capitalize">{item.createdAt.toLocaleString()}</span></p>
            </div>

          </div>
        </li>
      )}
    </Draggable>
  );
};


{/* <p className="text-xs text-gray-400">
                {item.createdAt.toLocaleString()}
              </p> */}