import React, { useEffect, useState } from "react";

import { useToDoContext } from "../../context/ToDoContext";
import {
  DataGrid,
  GridCellEditCommitParams,
  GridSelectionModel,
} from "@mui/x-data-grid";
import { Task, Status, initialTaskState } from "../../types/ToDoModel";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { loadTasksFromData } from "../../data/TaskHelper";
import { addTask, updateTask, removeTasks } from "../../context/ToDoReducer";
import "./TaskList.css";
import { useToDoDispatch } from "../../context/ToDoContext";

export const TaskList = (): JSX.Element => {
  const { dispatch } = useToDoDispatch();
  const { state } = useToDoContext();
  const { tasks, tasksLoaded } = state;
  const [selectionModel, setSelectionModel] = useState<GridSelectionModel>([]);

  useEffect(() => {
    loadTasksFromData(dispatch);
  }, [loadTasksFromData, dispatch]);

  const handleAddRow = () => {
    const newTask: Task = initialTaskState;

    dispatch(addTask(newTask));
  };

  const handleDeleteRows = () => {
    if (selectionModel && selectionModel.length > 0) {
      const deleteIds: [number] = [0];

      selectionModel.forEach((gridRowId) => {
        deleteIds.push(gridRowId as number);
      });

      dispatch(removeTasks(deleteIds));
    }
  };

  const handleCommit = (e: GridCellEditCommitParams) => {
    const array = tasks.map((t) => {
      if (t.id === e.id) {
        return { ...t, [e.field]: e.value };
      } else {
        return { ...t };
      }
    });

    const arrayUpdateItem = array.filter((t) => t.id === e.id);
    if (arrayUpdateItem.length === 1) {
      const updatedTask: Task = arrayUpdateItem[0] as Task;

      dispatch(updateTask(updatedTask));
    }
  };

  return (
    <div className="TaskList">
      <h4>Tasks</h4>
      {tasksLoaded && (
        <div style={{ width: "100%" }}>
          <Stack
            sx={{ width: "100%", mb: 1 }}
            direction="row"
            alignItems="flex-start"
            columnGap={1}
          >
            <Button size="small" onClick={handleAddRow}>
              Add a task
            </Button>
            <Button size="small" onClick={handleDeleteRows}>
              Delete Selected
            </Button>
          </Stack>
          <Box sx={{ height: 400, bgcolor: "background.paper" }}>
            <DataGrid
              rows={tasks}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5]}
              onCellEditCommit={handleCommit}
              checkboxSelection
              onSelectionModelChange={(newSelectionModel) => {
                setSelectionModel(newSelectionModel);
              }}
            />
          </Box>
        </div>
      )}
    </div>
  );
};

const columns = [
  {
    field: "id",
    headerName: "ID",
    width: 90,
  },
  {
    field: "description",
    headerName: "Description",
    width: 350,
    editable: true,
  },
  {
    field: "dueDate",
    headerName: "Due Date",
    width: 300,
    type: "date",
    editable: true,
  },
  {
    field: "status",
    headerName: "Status",
    width: 350,
    editable: true,
    type: "singleSelect",
    valueOptions: [Status.NotStarted, Status.InProgress, Status.Completed],
  },
];
