import Header from "components/header";
import { useEffect, useState } from "react";
import { TodoType } from "types";
import { Card, CardBody, IconButton, Text } from "@chakra-ui/react";
import { IoIosAddCircle } from "react-icons/io";

import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";

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

const getTodoLists = (): TodoType[] => {
  const todo1 = {
    ...defaultTodoValue,
    id: 1,
    title: "タスク１",
  };
  const todo2 = {
    ...defaultTodoValue,
    id: 2,
    title: "タスク２",
  };
  const todo3 = {
    ...defaultTodoValue,
    id: 3,
    title: "タスク３",
  };
  const todoListTmp: TodoType[] = [todo1, todo2, todo3];

  return todoListTmp;
};

const reorder = (
  todoList: TodoType[],
  startIndex: number,
  endIndex: number
): TodoType[] => {
  const result: TodoType[] = Array.from(todoList);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

export default function TodoCategoryListPage(): JSX.Element {
  const [todoLists, setTodoLists] = useState<TodoType[]>([]);

  useEffect(() => {
    setTodoLists(getTodoLists());
  }, []);

  const onDragEnd = (result: DropResult): void => {
    if (!result.destination) {
      return;
    }

    const items = reorder(
      todoLists,
      result.source.index,
      result.destination.index
    );

    setTodoLists(items);
  };

  return (
    <>
      <Header />
      <div className="flex justify-around m-8"></div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="bg-dashboard-color w-80">
          <div className="flex justify-between">
            <Text>Todo</Text>
            <IconButton
              aria-label="Search database"
              icon={<IoIosAddCircle />}
            />
          </div>
          <Droppable key={0} droppableId="todo">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {todoLists.map((todo, index) => {
                  return (
                    <Draggable
                      key={todo.id}
                      draggableId={`todo-${todo.id}`}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <Card className="bg-white m-4 p-4">
                            <CardBody>
                              <Text>{todo.title}</Text>
                            </CardBody>
                          </Card>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>
    </>
  );
}
