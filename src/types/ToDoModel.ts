export interface Task {
  id: number | undefined;
  description: string;
  dueDate: string | undefined;
  status: Status;
}

export enum Status {
  NotStarted = "Not Started",
  InProgress = "In Progress",
  Completed = "Completed",
}

export const initialTaskState: Task = {
  description: "",
  id: undefined,
  dueDate: undefined,
  status: Status.NotStarted,
};
