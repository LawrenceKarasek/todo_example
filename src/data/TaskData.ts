import { Status } from "../types/ToDoModel";
import { getRandomInt } from "../utils/Util";

const taskArray = [
  {
    id: getRandomInt(1000),
    description: "Get clown suit dry cleaned",
    dueDate: "5/1/2022",
    status: Status.InProgress,
  },
  {
    id: getRandomInt(1000),
    description: "Kid's party with clown suit",
    dueDate: "5/15/2022",
    status: Status.Completed,
  },
];

export default taskArray;
