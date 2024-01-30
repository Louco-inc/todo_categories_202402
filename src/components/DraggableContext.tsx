import { DeleteIcon } from "@chakra-ui/icons";
import { Tag, IconButton, Text } from "@chakra-ui/react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { MdAddCircle } from "react-icons/md";
import { TodoType } from "types";
import { formattedDate } from "utils";

type PropsType = {
  todoList: TodoType[];
  headerColor: string;
  headerText: string;
  propClassName: string;
  onOpenTodoForm: () => void;
  openTodoDetail: (todo: TodoType) => void;
  onDeleteTodo: (todo: TodoType) => void;
  onDragEndTest: (result: DropResult) => void;
};

export default function DraggableComponent(props: PropsType) {
  const {
    todoList,
    headerText,
    headerColor,
    propClassName,
    onOpenTodoForm,
    openTodoDetail,
    onDeleteTodo,
    onDragEndTest,
  } = props;
  return (
    <div className="bg-gray-100 w-96">
      <DragDropContext onDragEnd={onDragEndTest}>
        <div className={"h-4 rounded-t-xl" + ` ${headerColor}`}></div>
        <div className="flex justify-between mx-4">
          <Text fontSize="2xl" className="font-bold mb-2">
            {headerText}
          </Text>
          <IconButton
            variant="unstyled"
            className="!min-w-0 !min-h-0"
            aria-label="Search database"
            fontSize="24"
            icon={<MdAddCircle />}
            onClick={onOpenTodoForm}
          />
        </div>
        <Droppable droppableId="droppable">
          {(provided) => (
            <div
              className={propClassName}
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {todoList.map((todo, index) => {
                return (
                  <Draggable
                    key={todo.id}
                    draggableId={propClassName + "-" + String(todo.id)}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        className=""
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <div
                          className="flex justify-between m-4 p-4 bg-white rounded-lg max-w-96"
                          onClick={() => openTodoDetail(todo)}
                        >
                          <div className="">
                            {todo.categories.map((category) => {
                              return (
                                <Tag
                                  className="mr-1 mb-1"
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
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteTodo(todo);
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
  );
}
