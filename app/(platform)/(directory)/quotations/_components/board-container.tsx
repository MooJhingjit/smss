'use client'
import React from 'react'
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

interface Props {
  data?: any
}

export default function BoardContainer(props: Props) {
  const { data } = props

  const onDragEnd = (result: any) => {

  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="lists" type="list" >
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex gap-x-3 h-full"
          >

            <BoardColumn label="Quotation Open" idx={1} itemCount={20} />
            <BoardColumn label="Quotation Sent" idx={2} itemCount={8} />
            <BoardColumn label="Quotation Approved" idx={3} itemCount={5} />
            <BoardColumn label="Order Sent" idx={4} itemCount={7} />
            <BoardColumn label="Order Received" idx={5} itemCount={3} />
            <BoardColumn label="Delivered/Done" idx={6} itemCount={6} />
            {provided.placeholder}
            <div className="flex-shrink-0 w-1" />
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}

const BoardColumn = ({ label, idx, itemCount }: { label: string, idx: number, itemCount: number }) => {
  return (
    <div
      className="h-full min-w-[210px] select-none"
    >
      <div
        className="w-full rounded-md bg-gray-50 shadow-md pb-2 h-full"
      >
        <div className="flex justify-between items-center px-3 pt-2 pb-4">
          <div className="text-sm font-semibold text-[#4a4a4a] whitespace-nowrap">{label}</div>
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
                {
                  [...Array(itemCount)].map((_, i) => {
                    return (
                      <BoardCard idx={`${idx}-${i}`} id={i} />
                    )
                  })
                }
               
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </div>
      </div>
    </div>
  )
}


const BoardCard = ({ idx, id }: { idx: string, id: number }) => {
  return (
    <Draggable draggableId={idx.toString()} index={id}>
      {(provided) => (

        <li
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          className="w-full rounded-md bg-white shadow mb-3"
        >
          <div className="px-3 py-2 h-20">

          </div>
        </li>
      )}
    </Draggable>
  )
}