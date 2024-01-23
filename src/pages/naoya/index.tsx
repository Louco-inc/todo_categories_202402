import Header from "components/header";
import { useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { Text, IconButton, Tag } from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import { MdAddCircle } from "react-icons/md";

type CategoryType = {
  id?: number;
  name: string;
  color: string;
  slug: string;
  isValid: boolean;
  todoLists: TodoType[];
};

type TodoStatusType = "todo" | "inProgress" | "done";

type TodoFormType = {
  id?: number;
  title: string;
  description?: string;
  completionDate: string;
  status: TodoStatusType;
  categories: CategoryType[];
};

type TodoType = TodoFormType & {
  id: number;
  createdAt?: string;
  updatedAt: string;
};

const formattedDate = (date: Date | string): string => {
  const d: Date = (() => {
    if (typeof date === "string") {
      return new Date(date);
    } else {
      return date;
    }
  })();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function TodoCategoryListPage() {
  const [todoList, setTodoList] = useState<TodoType[]>([]);
  useEffect(() => {
    fetchTodoList();
  }, []);
  const fetchTodoList = async () => {
    const res = await fetch("/api/todo_lists").then((r) => r.json());
    setTodoList(res);
  };

  const onDragEndTest = (result) => {
    const items = [...todoList];
    const deleteItem = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, deleteItem[0]);

    setTodoList(items);
  };

  return (
    <>
      <Header />
      <div className="flex justify-around m-8">
        <div className="bg-gray-100 min-w-60">
          <div className="h-4 bg-todo-color rounded-t-xl"></div>
          <div className="flex justify-between mx-4">
            <Text fontSize="2xl" className="font-bold mb-2">
              Todo
            </Text>
            <IconButton
              variant="unstyled"
              className="!min-w-0 !min-h-0"
              aria-label="Search database"
              fontSize="24"
              icon={<MdAddCircle />}
              onClick={() => console.log("onClick")}
            />
          </div>
          <DragDropContext onDragEnd={onDragEndTest}>
            <Droppable droppableId="droppableId">
              {(provided) => (
                <div
                  className="todoList"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {todoList.map((todo, index) => {
                    return (
                      <Draggable
                        key={todo.id}
                        draggableId={String(todo.id)}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            className=""
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <div className="flex justify-between m-4 p-4 bg-white rounded-lg max-w-96">
                              <div className="">
                                {todo.categories.map((category) => {
                                  return (
                                    <Tag
                                      key={category.id}
                                      colorScheme={category.color}
                                    >
                                      {category.name}
                                    </Tag>
                                  );
                                })}
                                <Text fontSize="xl">{todo.title}</Text>
                                <Text className="text-border-gray" fontSize="sm">
                                  {formattedDate(todo.completionDate)}
                                </Text>
                              </div>
                              <div>
                                <IconButton
                                  variant="unstyled"
                                  className="!min-w-0 !min-h-0"
                                  aria-label="Search database"
                                  fontSize="20"
                                  icon={<DeleteIcon />}
                                  onClick={() => {
                                    console.log(todo.id);
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
        <div className="bg-gray-100">
          <div className="h-4 bg-inprogress-color rounded-t-xl"></div>
          <Text fontSize="2xl" className="font-bold mb-2 ml-2">
            Inprogress
          </Text>
          <DragDropContext onDragEnd={onDragEndTest}>
            <Droppable droppableId="droppableId">
              {(provided) => (
                <div
                  className="todoList"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {todoList.map((todo, index) => {
                    return (
                      <Draggable
                        key={todo.id}
                        draggableId={String(todo.id)}
                        index={index}
                      >
                        {(provided) => (
                          <div className="flex m-4 p-4 bg-white rounded-lg max-w-96">
                            <div className="">
                              {todo.categories.map((category) => {
                                return (
                                  <Tag
                                    key={category.id}
                                    colorScheme={category.color}
                                  >
                                    {category.name}
                                  </Tag>
                                );
                              })}
                              <Text>{todo.title}</Text>
                              <div>{formattedDate(todo.completionDate)}</div>
                            </div>
                            <div>
                              <IconButton
                                variant="unstyled"
                                className="!min-w-0 !min-h-0"
                                aria-label="Search database"
                                icon={<DeleteIcon />}
                                onClick={() => {
                                  console.log(todo.id);
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
        <div className="bg-gray-100">
          <div className="h-4 bg-done-color rounded-t-xl"></div>
          <Text fontSize="2xl" className="font-bold mb-2 ml-2">
            Done
          </Text>
          <DragDropContext onDragEnd={onDragEndTest}>
            <Droppable droppableId="droppableId">
              {(provided) => (
                <div
                  className="todoList"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {todoList.map((todo, index) => {
                    return (
                      <Draggable
                        key={todo.id}
                        draggableId={String(todo.id)}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            className=""
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <div className="flex m-4 p-4 bg-white rounded-lg max-w-96">
                              <div className="">
                                {todo.categories.map((category) => {
                                  return (
                                    <Tag
                                      key={category.id}
                                      colorScheme={category.color}
                                    >
                                      {category.name}
                                    </Tag>
                                  );
                                })}
                                <Text>{todo.title}</Text>
                                <div>{formattedDate(todo.completionDate)}</div>
                              </div>
                              <div>
                                <IconButton
                                  variant="unstyled"
                                  className="!min-w-0 !min-h-0"
                                  aria-label="Search database"
                                  icon={<DeleteIcon />}
                                  onClick={() => {
                                    console.log(todo.id);
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>
    </>
  );
}
