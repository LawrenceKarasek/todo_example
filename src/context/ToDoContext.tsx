import React from "react";
import { createContext, useReducer, useContext } from "react";
import {
  ToDoReducer,
  ToDoState,
  initialToDoState,
  ToDoActions,
} from "./ToDoReducer";

type ToDoContextType = {
  state: ToDoState;
  dispatch: React.Dispatch<ToDoActions>;
};

const ToDoContext = createContext<ToDoContextType>({
  state: initialToDoState,
  dispatch: () => undefined,
});

export const useToDoContext = (): ToDoContextType => {
  const context = useContext(ToDoContext);

  if (context === undefined) {
    throw new Error("useToDoContext must be used within ToDoContext");
  }

  return context;
};

export const useToDoDispatch = (): ToDoContextType => {
  const context = useContext(ToDoContext);

  if (context === undefined) {
    throw new Error("useToDoDispatch must be used within ToDoContext");
  }

  return context;
};

export const ToDoProvider = ({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element => {
  const [state, dispatch] = useReducer(ToDoReducer, initialToDoState);

  return (
    <ToDoContext.Provider value={{ state, dispatch }}>
      {children}
    </ToDoContext.Provider>
  );
};
