import Header from "components/header";
import React, { useCallback, useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { TodoType } from "types";

export default function TodoCategoryListPage(): JSX.Element {
  const [todoList, setTodoList] = useState<TodoType[]>([]);

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
    setTodoList(lists);
  };

  const onDragEnd = useCallback(() => {
    // the only one that is required
  }, []);

  return (<>
    <Header />
    <DragDropContext
      onDragEnd={onDragEnd}
    >
      <Droppable droppableId="droppable-1" type="PERSON">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            style={{ backgroundColor: snapshot.isDraggingOver ? 'blue' : 'grey' }}
            {...provided.droppableProps}
          >
            {todoList.map((item, index) => {
              return (
                <Draggable draggableId="draggable-1" index={0}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <h4>{item.title}</h4>
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
  </>);
}