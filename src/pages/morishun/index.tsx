import Header from "components/header";
import { useEffect, useState } from "react";
import { TodoType } from "types";
import {
  Card,
  CardBody,
  HStack,
  IconButton,
  Tag,
  TagLabel,
  Text,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import { IoIosAddCircle } from "react-icons/io";

import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";

// const defaultTodoValue: TodoType = {
//   id: -100,
//   title: "",
//   description: "",
//   completionDate: "",
//   status: "todo",
//   categories: [],
//   createdAt: "",
//   updatedAt: "",
// };

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

// 日付を「yyyy-mm-dd」にフォーマット
// 参考：https://ribbit.konomi.app/blog/javascript-date-format/
const getFormattedDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

export default function TodoCategoryListPage(): JSX.Element {
  const [todoLists, setTodoLists] = useState<TodoType[]>([]);

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
    console.log(lists);
    setTodoLists(lists);
  };

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
        <HStack className="flex justify-between content-center">
          {["todo", "inprogress", "done"].map((slug) => {
            return (
              <div key={slug} className="bg-dashboard-color w-80">
                <div className="flex justify-between">
                  <Text className="font-bold capitalize">{slug}</Text>
                  <IconButton
                    variant="unstyled"
                    aria-label="Search database"
                    icon={<IoIosAddCircle />}
                  />
                </div>
                <Droppable droppableId={slug}>
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {todoLists
                        .filter((todo) => todo.status === slug)
                        .map((todo, index) => {
                          return (
                            <Draggable
                              key={todo.id}
                              draggableId={`${slug}-${todo.id}`}
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
                                      <HStack className="flex justify-between">
                                        <div>
                                          <Text>{todo.status}</Text>
                                          {todo.categories.map((category) => {
                                            return (
                                              <Tag
                                                size="sm"
                                                key={category.id}
                                                colorScheme={category.color}
                                              >
                                                <TagLabel>
                                                  {category.name}
                                                </TagLabel>
                                              </Tag>
                                            );
                                          })}
                                          <Text className="font-bold">
                                            {todo.title}
                                          </Text>
                                          <Text>
                                            {getFormattedDate(
                                              new Date(todo.completionDate)
                                            )}
                                          </Text>
                                        </div>
                                        <IconButton
                                          variant="unstyled"
                                          aria-label="Search database"
                                          icon={<DeleteIcon />}
                                          onClick={() => {}}
                                        />
                                      </HStack>
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
            );
          })}
        </HStack>
      </DragDropContext>
    </>
  );
}
