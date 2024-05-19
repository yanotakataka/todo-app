import React, { useState } from "react";
import { TodoType } from "../types";
import { useTodos } from "../hooks/useTodos";
import { API_URL } from "../constants/URL";

type TodoProps = {
  todo: TodoType;
};

const Todo = ({ todo }: TodoProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.title);
  const { todos, isLoading, error, mutate } = useTodos();

  const handleEdit = async () => {
    setIsEditing(!isEditing);

    if (isEditing) {
      const response = await fetch(
        `${API_URL}/editTodo/${todo.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: editText,
            isCompleted: false,
          }),
        }
      );

      if (response.ok) {
        const editTodo = await response.json();
        const updatedTodos = todos.map((todo: TodoType) =>
          todo.id === editTodo.id ? editTodo : todo
        );
        mutate(updatedTodos);
      }
    }
  };

  const handleDelete = async () => {
    const response = await fetch(
      `${API_URL}/deleteTodo/${todo.id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const deleteTodo = await response.json();
      const deletedTodos = todos.filter(
        (todo: TodoType) => todo.id !== deleteTodo.id
      );
      mutate(deletedTodos);
    }
  };

  const handleCompletition = async () => {
    const response = await fetch(`${API_URL}/editTodo/${todo.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        isCompleted: !todo.isCompleted,
      }),
    });

    if (response.ok) {
      const editTodo = await response.json();
      const updatedTodos = todos.map((todo: TodoType) =>
        todo.id === editTodo.id ? editTodo : todo
      );
      mutate(updatedTodos);
    }
  };

  return (
    <div>
      <li className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="todo1"
              name="todo1"
              type="checkbox"
              checked={todo.isCompleted}
              onChange={handleCompletition}
              className="h-4 w-4 text-teal-600 focus:ring-teal-500
                  border-gray-300 rounded"
            />
            <label className="ml-3 block text-gray-900">
              {isEditing ? (
                <input
                  type="text"
                  className="border rounded py-1 px-2"
                  value={editText}
                  onChange={(e) => {
                    setEditText(e.target.value);
                  }}
                />
              ) : (
                <span
                  className={`text-lg font-medium mr-2 ${
                    todo.isCompleted && "line-through"
                  }`}
                >
                  {todo.title}
                </span>
              )}
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <button
              className="duration-150 bg-green-600 hover:bg-green-700 text-white font-medium py-1 px-2 rounded"
              onClick={handleEdit}
            >
              {isEditing ? "Save" : "✒"}
            </button>
            <button
              className="bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-2 rounded"
              onClick={handleDelete}
            >
              ✖
            </button>
          </div>
        </div>
      </li>
    </div>
  );
};

export default Todo;
