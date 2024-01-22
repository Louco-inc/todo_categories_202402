import Header from "components/header";
import { useEffect } from "react";

export default function TodoCategoryListPage() {
  useEffect(() => {
    fetchTodoList();
  }, []);
  const fetchTodoList = async () => {
    const res = await fetch("/api/todo_lists").then((r) => r.json());
    console.log(res);
  };
  return (
    <>
      <Header />
      <div>naoyaのページ</div>
    </>
  );
}
