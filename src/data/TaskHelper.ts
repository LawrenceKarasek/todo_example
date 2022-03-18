import React from "react";
import data from "./TaskData";
import {
  loadTasks,
  tasksLoaded,
  ToDoActions,
  error,
} from "../context/ToDoReducer";

export const loadTasksFromData = async (
  dispatch: React.Dispatch<ToDoActions>
): Promise<void> => {
  dispatch(loadTasks());

  try {
    return Promise.resolve(data).then((tasks) => {
      dispatch(tasksLoaded(tasks));
    });
  } catch (e) {
    dispatch(error());
  }
};
