import Header from "components/header";
import { useEffect, useState } from "react";
import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from "react-beautiful-dnd";
import {
  Text,
  IconButton,
  Tag,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import { MdAddCircle } from "react-icons/md";
import { TodoFormType, TodoType } from "types";
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

type DrabbleComponentProps = Record<
  string,
  {
    headerColor: string;
    headerText: string;
  }
>;

const drabbleComponentProps: DrabbleComponentProps = {
  todo: {
    headerColor: "bg-todo-color",
    headerText: "Todo",
  },
  inprogress: {
    headerColor: "bg-inprogress-color",
    headerText: "Inprogress",
  },
  done: {
    headerColor: "bg-done-color",
    headerText: "Done",
  },
};

const TODO_LIST_INDEX: Record<string, number> = {
  todo: 0,
  inprogress: 1,
  done: 2,
};

export default function TodoCategoryListPage(): JSX.Element {
  const [todoLists, setTodoLists] = useState<TodoType[][]>([]);
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

  const init = async (): Promise<void> => {
    await Promise.all(
      ["todo", "inprogress", "done"].map(async (status) => {
        const r = await fetch(`/api/todo_lists?status=${status}`);
        return await r.json();
      })
    ).then(([resTodoList, resInProgressList, resDoneList]) => {
      const todoList = resTodoList.map((todo: TodoType, i: number) => ({
        ...todo,
        slug: `todo-${todo.id}`,
      }));
      const inprogressList = resInProgressList.map(
        (todo: TodoType, i: number) => ({
          ...todo,
          slug: `inprogress-${todo.id}`,
        })
      );
      const doneList = resDoneList.map((todo: TodoType, i: number) => ({
        ...todo,
        slug: `done-${todo.id}`,
      }));
      setTodoLists([todoList, inprogressList, doneList]);
    });
  };

  const onDragEndTest = (result: DropResult): void => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      // 同じ列内でD&D
      const newTodoLists = [...todoLists];
      const targetId = TODO_LIST_INDEX[destination.droppableId];

      const targetList = newTodoLists[targetId];

      const targetTodo = targetList.find((todo) => todo.slug === draggableId);

      if (!targetTodo) return;
      // targetTodoのステータスを変更する
      const filteredTargetList = targetList.filter(
        (todo) => todo.slug !== draggableId
      );
      const resultTargetList = filteredTargetList.toSpliced(
        destination.index,
        0,
        targetTodo
      );
      newTodoLists[targetId] = resultTargetList;
      setTodoLists(newTodoLists);
    } else {
      // 別の列にD&D
      const newTodoLists = [...todoLists];
      const droppedTargetId = TODO_LIST_INDEX[destination.droppableId];
      const draggedTargetId = TODO_LIST_INDEX[source.droppableId];

      const droppedTargetList = newTodoLists[droppedTargetId];
      const draggedTargetList = newTodoLists[draggedTargetId];
      const targetTodo = draggedTargetList.find(
        (todo) => todo.slug === draggableId
      );
      if (!targetTodo) return;
      // targetTodoのステータスを変更する
      const addedTargetList = droppedTargetList.toSpliced(
        destination.index,
        1,
        targetTodo
      );
      newTodoLists.splice(droppedTargetId, 1, addedTargetList);

      const filteredTargetList = draggedTargetList.filter(
        (todo) => todo.slug !== draggableId
      );
      newTodoLists.splice(draggedTargetId, 1, filteredTargetList);
      setTodoLists(newTodoLists);
    }
  };

  const onSaveOrUpdateTodo = async (
    todoFormValue: TodoFormType
  ): Promise<void> => {
    const params = {
      ...todoFormValue,
      completionDate: new Date(todoFormValue.completionDate),
    };
    // 登録の場合
    if (!todoFormValue.id) {
      const res = await fetch("/api/todo_lists", {
        method: "POST",
        body: JSON.stringify(params),
      }).then(async (r) => await r.json());
      setTodoLists((prev) => {
        const todoListId = TODO_LIST_INDEX[res.status];
        const targetTodo: TodoType = {
          ...res,
          slug: `${res.status}-${res.id}`,
        };
        const newTodoLists = [...prev];
        newTodoLists[todoListId].splice(0, 1, targetTodo);
        return newTodoLists;
      });
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
        const targetTodoValue = {
          ...targetTodo,
          slug: `${targetTodo.status}-${targetTodo.id}`,
        };

        if (targetTodoValue.status === editingTodoForm.status) {
          // 変更されたステータスが同じ場合
          setTodoLists((prev) => {
            const newTodoLists = [...prev];
            const targetListIndex = TODO_LIST_INDEX[targetTodoValue.status];
            const targetList = newTodoLists[targetListIndex];
            const index = targetList.findIndex(
              (todo) => todo.id === targetTodoValue.id
            );
            const splicedTargetList = targetList.toSpliced(
              index,
              1,
              targetTodoValue
            );
            const result = newTodoLists.toSpliced(
              targetListIndex,
              1,
              splicedTargetList
            );
            return result;
          });
        } else {
          // 異なるステータスに変更された場合
          setTodoLists((prev) => {
            const newTodoLists = [...prev];
            const targetListIndex = TODO_LIST_INDEX[targetTodoValue.status];
            const prevTargetId = TODO_LIST_INDEX[editingTodoForm.status];

            const targetList = newTodoLists[targetListIndex];
            const prevTargetList = newTodoLists[prevTargetId];

            // 元々あったTodoを削除
            const filteredPrevTargetList = prevTargetList.filter(
              (todo) => todo.id !== targetTodoValue.id
            );
            const prevResult = newTodoLists.toSpliced(
              prevTargetId,
              1,
              filteredPrevTargetList
            );

            // 更新後のtargetTodoを追加
            const splicedTargetList = targetList.toSpliced(
              0,
              1,
              targetTodoValue
            );
            const result = prevResult.toSpliced(
              targetListIndex,
              1,
              splicedTargetList
            );
            return result;
          });
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

  const openTodoDetail = (todo: TodoType): void => {
    setShowingTodo(todo);
    onOpenDetailModal();
  };

  const onEditTodo = (todo: TodoType): void => {
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

  const onDeleteTodo = async (todo: TodoType): Promise<void> => {
    if (!todo.id) return;
    await fetch(`/api/todo_lists/${todo.id}`, {
      method: "DELETE",
    })
      .then((r) => {
        if (r.status === 200) {
          setTodoLists((prev) => {
            const newTodoLists = [...prev];
            const todoListIdx = TODO_LIST_INDEX[todo.status];
            const targetList = newTodoLists[todoListIdx];
            const filteredList = targetList.filter((t) => t.id !== todo.id);
            const result = newTodoLists.toSpliced(todoListIdx, 1, filteredList);
            return result;
          });
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
        <DragDropContext onDragEnd={onDragEndTest}>
          {todoLists.map((todoList, i) => {
            const slug = { 0: "todo", 1: "inprogress", 2: "done" }[i] ?? "todo";
            const componentProps = drabbleComponentProps[slug];
            return (
              <div key={slug}>
                <div
                  className={`h-4 rounded-t-xl ${componentProps.headerColor}`}
                ></div>
                <div className="flex justify-between mx-4">
                  <Text fontSize="2xl" className="font-bold mb-2">
                    {componentProps.headerText}
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
                <Droppable key={i} droppableId={`${slug}`}>
                  {(provided) => (
                    <div
                      className={slug}
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {todoList.map((todo, index) => {
                        return (
                          <Draggable
                            key={todo.id}
                            draggableId={todo.slug ?? ""}
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
              </div>
            );
          })}
        </DragDropContext>
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
