import Header from "components/header";
import { useEffect, useState } from "react";
import { TodoType, TodoStatusType, TodoFormType } from "types";
import {
  Card,
  CardBody,
  HStack,
  IconButton,
  Tag,
  TagLabel,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import { IoIosAddCircle } from "react-icons/io";

import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";

import TodoFormModal from "components/TodoFormModal";

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
  // Invalid Dateでない（正常な日付型の値）場合、フォーマットをかける
  // 参考：https://b.lollipop.onl/elgxqnm9p/
  if (!Number.isNaN(date.getDate())) {
    return date.toISOString().split("T")[0];
  }
  return "yyyy-mm-dd"; // 仮置き
};

const TODO_LIST_INDEX: Record<string, number> = {
  todo: 0,
  inprogress: 1,
  done: 2,
};

export default function TodoCategoryListPage(): JSX.Element {
  const [todoLists, setTodoLists] = useState<TodoType[][]>([[], [], []]);
  const [editingTodoForm, setEditingTodoForm] = useState<
    TodoFormType | undefined
  >(undefined);
  const {
    isOpen: isOpenTodoForm,
    onOpen: onOpenTodoForm,
    onClose: onCloseTodoForm,
  } = useDisclosure();
  const createdToast = useToast();

  useEffect(() => {
    const init = async (): Promise<void> => {
      await fetchTodoList();
    };
    init();
  }, []);

  const fetchTodoList = async (): Promise<void> => {
    const todoListsAll: TodoType[] = await fetch("/api/todo_lists").then(
      async (r) => await r.json()
    );
    const todoList = todoListsAll
      .filter((todo: TodoType) => todo.status === "todo")
      .map((todo: TodoType) => ({
        ...todo,
        slug: `todo-${todo.id}`,
      }));
    const inprogressList = todoListsAll
      .filter((todo: TodoType) => todo.status === "inprogress")
      .map((todo: TodoType) => ({
        ...todo,
        slug: `inprogress-${todo.id}`,
      }));
    const doneList = todoListsAll
      .filter((todo: TodoType) => todo.status === "done")
      .map((todo: TodoType) => ({
        ...todo,
        slug: `done-${todo.id}`,
      }));

    setTodoLists([todoList, inprogressList, doneList]);
  };

  const onDragEnd = (result: DropResult): void => {
    if (!result.destination) {
      return;
    }

    const { source, destination } = result;
    if (source.droppableId === destination.droppableId) {
      // 同じ列内でD&D
      // TodoListsの配列の中身の順番を入れ替える
      // ドラッグ対象のTodoのstatusのもののみ取り出す
      // todo:todoLists[0]を入れ替える
      // inprogress:todoLists[1]を入れ替える
      // done:todoLists[2]を入れ替える
      const targetTodoListId = TODO_LIST_INDEX[destination?.droppableId];
      const targetList = todoLists[targetTodoListId];
      if (targetList === undefined) return;
      const newTargetList = reorder(
        targetList,
        source.index,
        destination.index
      );
      let todoListTmp: TodoType[][] = [];
      switch (destination?.droppableId) {
        case "todo":
          todoListTmp = [newTargetList, todoLists[1], todoLists[2]];
          break;
        case "inprogress":
          todoListTmp = [todoLists[0], newTargetList, todoLists[2]];
          break;
        case "done":
          todoListTmp = [todoLists[0], todoLists[1], newTargetList];
          break;
      }

      setTodoLists(todoListTmp);
    } else {
      // 別の列にD&D
      // TodoListsの配列の中身の順番を入れ替える
      // ドラッグ元のstatusとドラッグ先のstatusのものを取り出す
      // ドラッグ元のstatusのもの：ドラッグするTodoを配列から削除
      // ドラッグ先のstatusのもの：ドラッグするTodoを配列に追加
      const newTodoLists = [...todoLists];
      const draggedTargetSlug: string = source.droppableId;
      const droppedTargetSlug: string = destination.droppableId;

      // ドラッグ元のstatusのListからドラッグするTodoを削除
      const draggedTodoListId = TODO_LIST_INDEX[draggedTargetSlug];
      const targetTodo: TodoType =
        newTodoLists[draggedTodoListId][source.index];
      newTodoLists[draggedTodoListId].splice(source.index, 1);

      // ドラッグ対象のstatusを更新
      targetTodo.status = droppedTargetSlug as TodoStatusType;

      // ドラッグ先のstatusのListにドロップするTodoを追加
      const droppedTodoListId = TODO_LIST_INDEX[droppedTargetSlug];
      newTodoLists[droppedTodoListId].splice(destination.index, 0, targetTodo);

      setTodoLists(newTodoLists);
    }
  };

  // Todo登録モーダルで「登録」ボタンを押下したときに動く処理
  const onSaveOrUpdateTodo = async (
    todoFormValue: TodoFormType
  ): Promise<void> => {
    const params = {
      ...todoFormValue,
      completionDate: new Date(todoFormValue.completionDate),
    };
    // 登録の場合
    // !todoFormValue.id：idがない = DBに存在しない
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
        newTodoLists[todoListId].splice(0, 0, targetTodo);
        return newTodoLists;
      });
      createdToast({
        title: "タスクが登録されました。",
        description: "",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom-right",
      });
    } else {
      // 更新の場合
      // TODO:更新の処理を書く
      // setEditingTodoFormのエラー回避のため一時的に記述
      setEditingTodoForm(undefined);
    }
  };

  return (
    <>
      <Header />
      <div className="flex justify-around m-8"></div>
      <DragDropContext onDragEnd={onDragEnd}>
        <HStack className="flex justify-between content-center">
          {["todo", "inprogress", "done"].map((slug, index) => {
            return (
              <div key={slug} className="bg-dashboard-color w-80">
                <div className="flex justify-between">
                  <Text className="font-bold capitalize">{slug}</Text>
                  <IconButton
                    variant="unstyled"
                    aria-label="Search database"
                    icon={<IoIosAddCircle />}
                    onClick={onOpenTodoForm}
                  />
                </div>
                <Droppable droppableId={slug}>
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {todoLists[index].map((todo, index) => {
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
      <TodoFormModal
        todoForm={editingTodoForm}
        isOpen={isOpenTodoForm}
        onClose={onCloseTodoForm}
        onSaveOrUpdateTodo={onSaveOrUpdateTodo}
      />
    </>
  );
}
