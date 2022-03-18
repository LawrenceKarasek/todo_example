import React from "react";
import { ToDoProvider } from "../../context/ToDoContext";
import { TaskList } from "../TaskList/TaskList";
import "./ToDo.css";

export const ToDo = (): JSX.Element => {
  return (
    <ToDoProvider>
      <div className="Header">
        <header>
          <p>
            React useReducer and useContext and Typscript example ToDo App with
            Material UI
          </p>
        </header>
      </div>
      <div className="ContentArea">
        <div className="MainContentArea">
          <TaskList />
        </div>
      </div>
    </ToDoProvider>
  );
};

export default ToDo;
