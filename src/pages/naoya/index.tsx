import Header from "components/header";
import { useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import {
  Text,
  IconButton,
  Tag,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import { MdAddCircle } from "react-icons/md";
import { TodoFormType, TodoStatusType, TodoType } from "types";
import { formattedDate } from "utils";
import TodoFormModal from "components/TodoFormModal";
import TodoDetailModal from "components/TodoDetailModal";

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

export default function TodoCategoryListPage() {
  const [todoList, setTodoList] = useState<TodoType[]>([]);
  const [inProgressList, setInProgressList] = useState<TodoType[]>([]);
  const [doneList, setDoneList] = useState<TodoType[]>([]);
  const [editingTodoForm, setEditingTodoForm] = useState<
    TodoFormType | undefined
  >(undefined);
  const [showingTodo, setShowingTodo] = useState<TodoType>(defaultTodoValue);
  const {
    isOpen: isOpenTodoForm,
    onOpen: onOpenTodoForm,
    onClose: onCloseTodoForm,
  } = useDisclosure();
  const {
    isOpen: isOpenDetailModal,
    onOpen: onOpenDetailModal,
    onClose: onCloseDetailModal,
  } = useDisclosure();
  const createdToast = useToast();

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    await Promise.all(
      ["todo", "inProgress", "done"].map((status) => {
        return fetch(`/api/todo_lists?status=${status}`).then((r) => r.json());
      })
    ).then(([resTodoList, resInProgressList, resDoneList]) => {
      setTodoList(resTodoList);
      setInProgressList(resInProgressList);
      setDoneList(resDoneList);
    });
  };

  const onDragEndTest = (result) => {
    const items = [...todoList];
    const deleteItem = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, deleteItem[0]);

    setTodoList(items);
  };

  const onSaveOrUpdateTodo = async (todoFormValue: TodoFormType) => {
    const params = {
      ...todoFormValue,
      completionDate: new Date(todoFormValue.completionDate),
    };
    // 登録の場合
    if (!todoFormValue.id) {
      const res = await fetch("/api/todo_lists", {
        method: "POST",
        body: JSON.stringify(params),
      }).then((r) => r.json());
      const setterObj = {
        todo: setTodoList,
        inProgress: setInProgressList,
        done: setDoneList,
      };
      const status: TodoStatusType = res.status;
      const setter = setterObj[status];
      setter((prev) => [res, ...prev]);
      createdToast({
        title: "タスクが登録されました。",
        description: "",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      if (!editingTodoForm?.title || !editingTodoForm?.status) {
        return;
      }
      await fetch(`/api/todo_lists/${todoFormValue.id}`, {
        method: "PUT",
        body: JSON.stringify(params),
      }).then(async (r) => {
        const targetTodo: TodoType = await r.json();
        const setterObj = {
          todo: setTodoList,
          inProgress: setInProgressList,
          done: setDoneList,
        };
        const status: TodoStatusType = targetTodo.status;
        if (status === editingTodoForm.status) {
          // 変更されたステータスが同じ場合
          const setter = setterObj[status];
          setter((prev) => {
            const index = prev.findIndex(
              (todo) => todo.id === todoFormValue.id
            );
            const convertedTodoList = prev.toSpliced(index, 1, targetTodo);
            return convertedTodoList;
          });
        } else {
          // 異なるステータスに変更された場合
          const prevStatus: TodoStatusType = editingTodoForm.status;
          const prevSetter = setterObj[prevStatus];
          prevSetter((prev) => prev.filter((p) => p.id !== todoFormValue.id));
          const setter = setterObj[status];
          setter((prev) => [targetTodo, ...prev]);
        }
        setEditingTodoForm(undefined);
        createdToast({
          title: "タスクが更新されました。",
          description: "",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      });
    }
  };

  const openTodoDetail = (todo: TodoType) => {
    setShowingTodo(todo);
    onOpenDetailModal();
  };

  const onEditTodo = (todo: TodoType) => {
    onCloseDetailModal();
    const formValue: TodoFormType = {
      id: todo.id,
      title: todo.title,
      description: todo.description,
      completionDate: formattedDate(todo.completionDate),
      status: todo.status,
      categoryIds: todo.categories.map((c) => c.id),
    };
    setEditingTodoForm(formValue);
    onOpenTodoForm();
  };

  const onDeleteTodo = async (todo: TodoType) => {
    if (!todo.id) return;
    await fetch(`/api/todo_lists/${todo.id}`, {
      method: "DELETE",
    })
      .then((r) => {
        if (r.status === 200) {
          const setterObj = {
            todo: setTodoList,
            inProgress: setInProgressList,
            done: setDoneList,
          };
          const status: TodoStatusType = todo.status;
          const setter = setterObj[status];
          setter((prev) => prev.filter((t) => t.id !== todo.id));
          createdToast({
            title: "タスクが削除されました。",
            description: "",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        }
      })
      .catch((e) => {
        console.log(e);
        createdToast({
          title: "タスクの削除に失敗しました。",
          description: "",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      })
      .finally(() => onCloseDetailModal());
  };

  return (
    <>
      <Header />
      <div className="flex justify-around m-8">
        <div className="bg-gray-100 w-96">
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
              onClick={() => onOpenTodoForm()}
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
                                <Text
                                  className="text-border-gray"
                                  fontSize="sm"
                                >
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
        <div className="bg-gray-100 w-96">
          <div className="h-4 bg-inprogress-color rounded-t-xl"></div>
          <div className="flex justify-between mx-4">
            <Text fontSize="2xl" className="font-bold mb-2">
              Inprogress
            </Text>
            <IconButton
              variant="unstyled"
              className="!min-w-0 !min-h-0"
              aria-label="Search database"
              fontSize="24"
              icon={<MdAddCircle />}
              onClick={() => onOpenTodoForm()}
            />
          </div>
          <DragDropContext onDragEnd={onDragEndTest}>
            <Droppable droppableId="droppableId">
              {(provided) => (
                <div
                  className="inProgressList"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {inProgressList.map((todo, index) => {
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
                                <Text
                                  className="text-border-gray"
                                  fontSize="sm"
                                >
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
        <div className="bg-gray-100 w-96">
          <div className="h-4 bg-done-color rounded-t-xl"></div>
          <div className="flex justify-between mx-4">
            <Text fontSize="2xl" className="font-bold mb-2">
              Done
            </Text>
            <IconButton
              variant="unstyled"
              className="!min-w-0 !min-h-0"
              aria-label="Search database"
              fontSize="24"
              icon={<MdAddCircle />}
              onClick={() => onOpenTodoForm()}
            />
          </div>
          <DragDropContext onDragEnd={onDragEndTest}>
            <Droppable droppableId="droppableId">
              {(provided) => (
                <div
                  className="doneList"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {doneList.map((todo, index) => {
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
                                <Text
                                  className="text-border-gray"
                                  fontSize="sm"
                                >
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
      </div>
      <TodoFormModal
        isOpen={isOpenTodoForm}
        todoForm={editingTodoForm}
        onClose={onCloseTodoForm}
        onSaveOrUpdateTodo={onSaveOrUpdateTodo}
      />
      <TodoDetailModal
        isOpen={isOpenDetailModal}
        onClose={onCloseDetailModal}
        todoDetail={showingTodo}
        onEdit={onEditTodo}
        onDelete={onDeleteTodo}
      />
    </>
  );
}
