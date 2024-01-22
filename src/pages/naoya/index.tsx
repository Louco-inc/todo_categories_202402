import Header from "components/header";
import { useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

export default function TodoCategoryListPage() {
  const [todoList, setTodoList] = useState([]);
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
      <div>
        <div>
          <DragDropContext onDragEnd={onDragEndTest}>
            <Droppable droppableId="droppableId">
              {(provided) => (
                <div
                  className="todoList"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {todoList.map(({ id, title }, index) => {
                    return (
                      <Draggable
                        key={id}
                        draggableId={String(id)}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            className="testItem"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <div>
                              {id}：{title}
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
