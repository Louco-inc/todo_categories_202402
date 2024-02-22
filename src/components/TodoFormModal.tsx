import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Badge,
  Checkbox,
  CheckboxGroup,
  FormErrorMessage,
  Input,
  Textarea,
  Select,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { CategoryType, TodoFormType, TodoStatusType } from "types";
import { formattedDate } from "utils";

const defaultFormValue: TodoFormType = {
  title: "",
  description: "",
  completionDate: formattedDate(new Date()),
  status: "todo",
  categoryIds: [],
};

type PropsType = {
  todoForm: TodoFormType | undefined;
  isOpen: boolean;
  onClose: () => void;
  onSaveOrUpdateTodo: (todoFormValue: TodoFormType) => void;
};

export default function TodoFormModal(props: PropsType): JSX.Element {
  const { todoForm, isOpen, onClose, onSaveOrUpdateTodo } = props;
  const [todoFormValue, setTodoFormValue] =
    useState<TodoFormType>(defaultFormValue);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const createdToast = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    todoForm && setTodoFormValue(todoForm);
  }, [todoForm]);

  const fetchCategories = async (): Promise<void> => {
    const res: CategoryType[] = await fetch("/api/categories").then(
      async (r) => await r.json()
    );
    setCategories(res);
  };

  const updateCategories = (categoryId: number): void => {
    if (todoFormValue.categoryIds.includes(categoryId)) {
      setTodoFormValue((prev) => ({
        ...prev,
        categoryIds: prev.categoryIds.filter((id: number) => id !== categoryId),
      }));
    } else {
      setTodoFormValue((prev) => ({
        ...prev,
        categoryIds: [...prev.categoryIds, categoryId],
      }));
    }
  };

  const confirmTodoForm = (): void => {
    if (!todoFormValue.title) {
      createdToast({
        title: "タイトルが入力されていません",
        description: "",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    onSaveOrUpdateTodo(todoFormValue);
    closeModal();
  };

  const closeModal = (): void => {
    setTodoFormValue(defaultFormValue);
    onClose();
  };
  return (
    <>
      <Modal isOpen={isOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader></ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl className="mt-4">
              <FormLabel>タスク名</FormLabel>
              <Input
                type="text"
                value={todoFormValue.title}
                onChange={(e) =>
                  setTodoFormValue((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
              />
              <FormErrorMessage>
                タイトルが入力されていません。
              </FormErrorMessage>
            </FormControl>
            <FormControl className="mt-4">
              <FormLabel>タスク内容</FormLabel>
              <Textarea
                value={todoFormValue.description}
                onChange={(e) =>
                  setTodoFormValue((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </FormControl>
            <FormControl className="mt-4">
              <FormLabel>ステータス</FormLabel>
              <Select
                value={todoFormValue.status}
                onChange={(e) =>
                  setTodoFormValue((prev) => ({
                    ...prev,
                    status: e.target.value as TodoStatusType,
                  }))
                }
              >
                <option value="todo">todo</option>
                <option value="inprogress">inprogress</option>
                <option value="done">done</option>
              </Select>
            </FormControl>
            <FormControl className="mt-4">
              <FormLabel>カテゴリ</FormLabel>
              <CheckboxGroup>
                {categories.map((category) => {
                  return (
                    <Checkbox
                      key={category.id}
                      isChecked={todoFormValue.categoryIds.includes(
                        category.id
                      )}
                      className="mr-2 my-2"
                      onChange={() => updateCategories(category.id)}
                    >
                      <Badge
                        key={category.id}
                        className="px-1 mr-1"
                        colorScheme={category.color}
                      >
                        {category.name}
                      </Badge>
                    </Checkbox>
                  );
                })}
              </CheckboxGroup>
            </FormControl>
            <FormControl className="mt-4">
              <FormLabel>期限日</FormLabel>
              <Input
                type="date"
                value={todoFormValue.completionDate}
                onChange={(e) =>
                  setTodoFormValue((prev) => ({
                    ...prev,
                    completionDate: e.target.value,
                  }))
                }
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="teal" mr={3} onClick={() => confirmTodoForm()}>
              {!todoForm?.id ? '登録' : '更新'}
            </Button>
            <Button
              colorScheme="gray"
              mr={3}
              onClick={() => {
                closeModal();
              }}
            >
              キャンセル
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
