import { Task } from "../types/ToDoModel";
import { getRandomInt } from "../utils/Util";

export type ToDoActions =
  | LoadTasks
  | TasksLoaded
  | AddTask
  | UpdateTask
  | RemoveTasks
  | Error;

export enum ActionType {
  LoadTasks,
  AddTask,
  UpdateTask,
  RemoveTasks,
  TasksLoaded,
  Error,
}

export interface ToDoState {
  tasks: Task[];
  tasksLoading: boolean;
  tasksLoaded: boolean;
  error: boolean;
}

export const initialToDoState: ToDoState = {
  tasks: [],
  tasksLoaded: false,
  tasksLoading: false,
  error: false,
};

const removeTaskArray = (currentTasks: Task[], ids: [number]): Task[] => {
  const updatedArray: Task[] = [];

  if (currentTasks && currentTasks.length > 0) {
    currentTasks.forEach((task: Task) => {
      if (!ids.find((id) => id === task.id)) {
        updatedArray.push(task);
      }
    });
  }

  return updatedArray;
};

export const ToDoReducer = (
  state: ToDoState,
  action: ToDoActions
): ToDoState => {
  switch (action.type) {
    case ActionType.LoadTasks:
      return { ...state, tasksLoading: true, tasksLoaded: false };
    case ActionType.TasksLoaded:
      return {
        ...state,
        tasks: action.payload,
        tasksLoading: false,
        tasksLoaded: true,
        error: false,
      };
    case ActionType.AddTask:
      return {
        ...state,
        tasks: [{ ...action.payload, id: getRandomInt(1000) }, ...state.tasks],
      };
    case ActionType.UpdateTask:
      return {
        ...state,
        tasks: state.tasks.map((task: Task) => {
          if (task.id === action.payload.id) {
            return action.payload;
          } else {
            return task;
          }
        }),
      };
    case ActionType.RemoveTasks:
      return {
        ...state,
        tasks: removeTaskArray(state.tasks, action.payload),
      };
    case ActionType.Error:
      return { ...state, error: true, tasksLoading: false, tasksLoaded: false };
    default:
      return state;
  }
};

type LoadTasks = {
  type: ActionType.LoadTasks;
};

type TasksLoaded = {
  type: ActionType.TasksLoaded;
  payload: Task[];
};

type AddTask = {
  type: ActionType.AddTask;
  payload: Task;
};

type UpdateTask = {
  type: ActionType.UpdateTask;
  payload: Task;
};

type RemoveTasks = {
  type: ActionType.RemoveTasks;
  payload: [number];
};

type Error = { type: ActionType.Error };

export const loadTasks = (): LoadTasks => ({
  type: ActionType.LoadTasks,
});

export const tasksLoaded = (tasks: Task[]): TasksLoaded => ({
  type: ActionType.TasksLoaded,
  payload: tasks,
});

export const addTask = (task: Task): AddTask => ({
  type: ActionType.AddTask,
  payload: task,
});

export const updateTask = (task: Task): UpdateTask => ({
  type: ActionType.UpdateTask,
  payload: task,
});

export const removeTasks = (ids: [number]): RemoveTasks => ({
  type: ActionType.RemoveTasks,
  payload: ids,
});

export const error = (): Error => ({
  type: ActionType.Error,
});
