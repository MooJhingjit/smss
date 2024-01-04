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
          <ol
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex gap-x-3 h-full"
          >

            <BoardColumn idx={1} />
            <BoardColumn idx={2} />
            <BoardColumn idx={3} />
            <BoardColumn idx={4} />
            {provided.placeholder}
            <div className="flex-shrink-0 w-1" />
          </ol>
        )}
      </Droppable>
    </DragDropContext>
  )
}

const BoardColumn = ({ idx }: { idx: number }) => {
  return (
    <li
      className="shrink-0 h-full w-[272px] select-none"
    >
      <div
        className="w-full rounded-md bg-gray-50 shadow-md pb-2"
      >
        <div className="flex justify-between items-center px-3 pt-2 pb-4">
          <div className="text-sm font-semibold text-[#4a4a4a]">To Do</div>
          <div className="text-sm font-semibold text-[#4a4a4a]">0/0</div>
        </div>
        <div className="h-full px-3">
          <Droppable droppableId={`list-${idx}`} type="card">
            {(provided) => (
              <ul
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="h-full"
              >
                <BoardCard idx={`${idx}-1`} id={1} />
                <BoardCard idx={`${idx}-2`} id={2} />
                <BoardCard idx={`${idx}-3`} id={3} />
                <BoardCard idx={`${idx}-4`} id={4} />
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </div>
      </div>
    </li>
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
          className="w-full rounded-md bg-white shadow-md mb-3"
        >
          <div className="px-3 py-2 h-40">

          </div>
        </li>
      )}
    </Draggable>
  )
}