export type CategoryType = {
  id: number;
  name: string;
  color: string;
  slug: string;
  isValid: boolean;
  todoLists: TodoType[];
};

export type TodoStatusType = "todo" | "inprogress" | "done";

export type TodoFormType = {
  id?: number;
  title: string;
  description?: string;
  completionDate: string;
  status: TodoStatusType;
  categoryIds: number[];
};

export type TodoType = Omit<TodoFormType, "categoryIds"> & {
  id: number;
  categories: CategoryType[];
  createdAt?: string;
  updatedAt: string;
  slug?: string;
};
