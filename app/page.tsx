"use client";

import Todo from "./components/Todo";
import { TodoType } from "./types";
import { useEffect, useState } from "react";
import { useTodos } from "./hooks/useTodos";
import { API_URL } from "./constants/URL";
import { useSocket } from "./provider/socketProvider";

export default function Home() {
  const { socket } = useSocket();
  const { todos, isLoading, error, mutate } = useTodos();
  const [inputTodo, setInputTodo] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(
    null
  );

  useEffect(() => {
    socket.on("send_todo", (todos) => {
      mutate(todos);
    });

    const recognition = new webkitSpeechRecognition();
    recognition.lang = "ja-JP";
    recognition.continuous = true;
    recognition.interimResults = true;
    setRecognition(recognition);

    return () => {
      socket.removeListener("send_todo");
    };
  }, []);

  useEffect(() => {
    if (!recognition) return;
    if (isRecording) {
      recognition.start();
    } else {
      recognition.stop();
    }
  }, [isRecording]);

  useEffect(() => {
    if (!recognition) return;
    recognition.onresult = (event) => {
      const results = event.results;
      for (let i = event.resultIndex; i < results.length; i++) {
        setInputTodo(results[i][0].transcript);
      }
    };
  }, [recognition]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputTodo === "") return;

    const response = await fetch(`${API_URL}/createTodo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: inputTodo,
        isCompleted: false,
      }),
    });

    if (response.ok) {
      const newTodo = await response.json();
      socket.emit("send_todo", [...todos, newTodo]);
      mutate([...todos, newTodo]);
      setInputTodo("");
    }
  };

  const handleRecoding = () => {
    if (!isRecording) {
      setInputTodo("");
    }
    setIsRecording((prev) => !prev);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-lg mx-auto bg-white shadow-lg rounded-lg overflow-hidden mt-32 py-4 px-4">
      <div className="px-4 py-2">
        <h1 className="text-gray-800 font-bold text-2xl uppercase">
          タスク管理アプリ
        </h1>
      </div>
      <form
        className="w-full max-w-md mx-auto px-4 py-2"
        onSubmit={handleSubmit}
      >
        <div className="flex items-center border-b-2 border-teal-500 py-2">
          <input
            className="appearance-none bg-transparent
      border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight
      focus:outline-none"
            type="text"
            placeholder="タスクを入力"
            value={inputTodo}
            onChange={(e) => setInputTodo(e.target.value)}
          />
          <button
            className="duration-150 flex-shrink-0 bg-blue-500 hover:bg-blue-700 border-blue-500 hover:border-blue-700 text-sm border-4 text-white py-1 px-2 mr-2 rounded"
            onClick={handleRecoding}
            type="button"
          >
            {isRecording ? "停止" : "音声で入力"}
          </button>
          <button
            className="duration-150 flex-shrink-0 bg-blue-500 hover:bg-blue-700 border-blue-500 hover:border-blue-700 text-sm border-4 text-white py-1 px-2 rounded"
            type="submit"
          >
            追加
          </button>
        </div>
      </form>
      <ul className="divide-y divide-gray-200 px-4">
        {todos.map((todo: TodoType) => (
          <Todo key={todo.id} todo={todo} />
        ))}
      </ul>
    </div>
  );
}
