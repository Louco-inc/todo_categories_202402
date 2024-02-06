import Header from "components/header";
import React, { useCallback, useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { TodoType } from "types";

const defaultTodoValue: TodoType = {
  id: -100,
  title: "",
  description: "",
  completionDate: "",
  status: "todo",
  categories: [],
  createdAt: "",
  updatedAt: "",
};

export default function TodoCategoryListPage(): JSX.Element {
  const [todoList, setTodoList] = useState<TodoType[]>([]);

  useEffect(() => {
    const init = async (): Promise<void> => {
      await fetchTodoList();
    };
    init();
  }, []);

  const fetchTodoList = async (): Promise<void> => {
    const lists: TodoType[] = await fetch("/api/todo_lists").then(
      async (r) => await r.json()
    );
    setTodoList(lists);
  };

  const onDragEnd = useCallback(() => {
    // the only one that is required
  }, []);

  return (<>
    <Header />
    <DragDropContext
      onDragEnd={onDragEnd}
    >
      <Droppable key={0} droppableId="todo1">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {
              todoList.map((item, index) => (
                <Draggable key={item.id} draggableId={`${item.id}`} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      {item.title}
                    </div>
                  )}
                </Draggable>
              ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  </>);
}