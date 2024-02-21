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
  const [todoLists, settodoLists] = useState<TodoType[][]>([[], [], []]);

  useEffect(() => {
    const init = async (): Promise<void> => {
      await fetchtodoLists();
    };
    init();
  }, []);

  const fetchtodoLists = async (): Promise<void> => {
    const lists: TodoType[] = await fetch("/api/todo_lists").then(
      async (r) => await r.json()
    );
    const todoLists = lists
    .filter((todo: TodoType) => todo.status === "todo")
    .map((todo: TodoType) => ({
      ...todo,
      slug: `todo-${todo.id}`,
    }));
  const inprogressList = lists
    .filter((todo: TodoType) => todo.status === "inprogress")
    .map((todo: TodoType) => ({
      ...todo,
      slug: `inprogress-${todo.id}`,
    }));
  const doneList = lists
    .filter((todo: TodoType) => todo.status === "done")
    .map((todo: TodoType) => ({
      ...todo,
      slug: `done-${todo.id}`,
    }));

  settodoLists([todoLists, inprogressList, doneList]);
  };

  const onDragEnd = useCallback(() => {
    // the only one that is required
  }, []);

  return (<>
    <Header />
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable key={0} droppableId="todo1123">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {
              todoLists.map((item, index) => (
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