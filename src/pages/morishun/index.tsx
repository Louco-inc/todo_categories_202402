import Header from "components/header";
import { useEffect, useState, useRef } from "react";
import { TodoType, TodoStatusType, TodoFormType } from "types";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Card,
  CardBody,
  HStack,
  IconButton,
  Tag,
  TagLabel,
  Text,
  useDisclosure,
  useToast,
  Button,
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

const dashboardHeaderColor: Record<string, string> = {
	todo: "bg-todo-color",
	inprogress: "bg-inprogress-color",
	done: "bg-done-color",
};

export default function TodoCategoryListPage(): JSX.Element {
  const [todoLists, setTodoLists] = useState<TodoType[][]>([[], [], []]);
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
  const {
    isOpen: isOpenDeleteDialog,
    onOpen: onOpenDeleteDialog,
    onClose: onCloseDeleteDialog,
  } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [targetTodoTitle, setTargetTodoTitle] = useState<string | undefined>(
    undefined
  );
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
			const todoListsTmp: TodoType[][] = [...todoLists];
			const resultTodoLists: TodoType[][] = todoListsTmp.toSpliced(targetTodoListId, 1, newTargetList);

      setTodoLists(resultTodoLists);
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
			setEditingTodoForm(undefined);
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
      if (!editingTodoForm?.title || !editingTodoForm.status) {
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
        // 変更されたステータスが同じ場合、インデックスはそのままに項目の値のみ更新
        if (targetTodoValue.status === editingTodoForm.status) {
          setTodoLists((prev) => {
            const newTodoLists = [...prev];
            const targetListIndex = TODO_LIST_INDEX[targetTodoValue.status];
            const targetList = newTodoLists[targetListIndex];
            const targetIndex = targetList.findIndex(
              (todo) => todo.id === targetTodoValue.id
            );
            const splicedTargetList = targetList.toSpliced(
              targetIndex,
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
          // 異なるステータスに変更された場合、変更先のステータスのリストの1番上に表示
          setTodoLists((prev) => {
            const newTodoLists = [...prev];
            const targetListIndex = TODO_LIST_INDEX[targetTodoValue.status];
            const prevTargetListIndex = TODO_LIST_INDEX[editingTodoForm.status];

            const targetList = newTodoLists[targetListIndex];
            const prevTargetList = newTodoLists[prevTargetListIndex];

            // 元々あったTodoを削除
            const filteredPrevTargetList = prevTargetList.filter(
              (todo) => todo.id !== targetTodoValue.id
            );
            const prevResult = newTodoLists.toSpliced(
              prevTargetListIndex,
              1,
              filteredPrevTargetList
            );

            // 変更したTodoを変更先のステータスの1番上に追加
            const splicedTargetList = targetList.toSpliced(
              0,
              0,
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
      });
      setEditingTodoForm(undefined);
      createdToast({
        title: "タスクが更新されました。",
        description: "",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom-right",
      });
    }
  };

  // Todoのカードをクリックした時の処理
  const openTodoDetail = (todo: TodoType): void => {
    setShowingTodo(todo);
    onOpenDetailModal();
  };

  // Todoを編集する時の処理
  const onEditTodo = (todo: TodoType): void => {
    onCloseDetailModal();
    const todoFormValue: TodoFormType = {
      id: todo.id,
      title: todo.title,
      description: todo.description,
      completionDate: getFormattedDate(new Date(todo.completionDate)),
      status: todo.status,
      categoryIds: todo.categories.map((category) => category.id),
    };
    setEditingTodoForm(todoFormValue);
    onOpenTodoForm();
  };

  // Todoを削除する時の処理
  /**
   * ・ゴミ箱アイコンクリック
   * ・削除対象のTodoのID、titleをstateに保持
   * ・削除確認モーダルをオープン
   * ・モーダルの削除ボタンをクリック
   * ・onDeleteTodoを動かす
   *
   */
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
            newTodoLists.splice(todoListIdx, 1, filteredList);
            return newTodoLists;
          });
          createdToast({
            title: "タスクが削除されました。",
            description: "",
            status: "success",
            duration: 3000,
            isClosable: true,
            position: "bottom-right",
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
          position: "bottom-right",
        });
      })
      .finally(() => onCloseDetailModal());
  };

	// Todo編集モーダルを閉じたときにeditingTodoFormの値を破棄させる
	const closeTodoFormModal = (): void => {
		setEditingTodoForm(undefined);
		onCloseTodoForm();
	} 

  return (
    <>
      <Header />
      <div className="flex justify-around m-2"></div>
      <DragDropContext onDragEnd={onDragEnd}>
        <HStack className="flex justify-around items-start mx-8">
          {["todo", "inprogress", "done"].map((slug, index) => {
            return (
              <div key={slug} className="bg-dashboard-color w-1/3 rounded-lg m-2">
                <div className={`h-4 rounded-t-lg ${dashboardHeaderColor[slug]}`}></div>
								<div className="flex justify-between items-center justify-items-center m-4">
                  <Text className="font-bold capitalize text-2xl">{slug}</Text>
                  <IconButton
										variant="ghost"
                    aria-label="Search database"
                    icon={<IoIosAddCircle className="size-3/4"/>}
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
                                <Card
                                  className="bg-white m-4 p-4"
                                  onClick={() => openTodoDetail(todo)}
                                >
                                  <CardBody>
                                    <HStack className="flex justify-between">
                                      <div>
                                        {todo.categories.map((category) => {
                                          return (
                                            <Tag
																							className="text-balance"
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
                                        icon={<DeleteIcon className="size-3/4"/>}
                                        onClick={(event) => {
																					event.stopPropagation();	// Cardコンポーネントへのクリックイベント伝播を止める
																					setShowingTodo(todo);
																					setTargetTodoTitle(todo.title);
																					onOpenDeleteDialog();
																				}}
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
        onClose={closeTodoFormModal}
        onSaveOrUpdateTodo={onSaveOrUpdateTodo}
      />
      <TodoDetailModal
        todoDetail={showingTodo}
        isOpen={isOpenDetailModal}
        onClose={onCloseDetailModal}
        onEdit={onEditTodo}
        onDelete={(todo: TodoType) => {
          setTargetTodoTitle(todo.title);
          onOpenDeleteDialog();
        }}
      />
      <AlertDialog
        isOpen={isOpenDeleteDialog}
        leastDestructiveRef={cancelRef}
        onClose={onCloseDeleteDialog}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              タスクの削除
            </AlertDialogHeader>

            <AlertDialogBody>
              <Text>以下のタスクを削除します。</Text>
              <Text>削除すると元に戻りません。よろしいですか？</Text>
              <Text className="mt-5">タスク名：{targetTodoTitle}</Text>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onCloseDeleteDialog}>
                キャンセル
              </Button>
              <Button
                colorScheme="red"
                onClick={async () => {
                  if (isOpenDetailModal) {
                    onCloseDetailModal();
                  }
                  await onDeleteTodo(showingTodo);
                  onCloseDeleteDialog();
                }}
                ml={3}
              >
                削除
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}
