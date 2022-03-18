# Using React useContext and useReducer with Typescript and Material UI

## Introduction

Managing data access and state management becomes an increasing challenge as projects grow. The responsiblities of loading, updating and managing data in UI comoponents can make UI code complex and unmanageable. The most common pattern for state management in a react app is through react-redux. React's useContext and useReducer is an another approach to managing application state. (Resources to compare react-redux with useContext and useReducer are provided at the end of this document.) Typescript improves a code base by identifying type compatibility issues at compile time and has good autocomplete features.

This article is a step-by-step guide to implementing the useContext and useReducer React hooks with Typescript and Material UI. We will create a simple ToDo app in React and load and manage the state using useReducer/useContext hooks. Note: All the code sample mentioned below can be found in codesandbox: <https://codesandbox.io/s/nostalgic-golick-r5rwvt> 

**Assumptions**

This guide assumes you have a working ability in React but have not yet implemented Typescript in a React project.

**Benefits of Typescript**

Typescript is superset of javascript the allows the definition of types and interfaces which are checked at compile time and provide intellisense. These benefits can help prevent run time errors and improve the maintainability and speed of development.

## Project Setup

The project uses create react app with the template typescript. The command to run the create react app with the typescript option can be found in the documentation : <https://create-react-app.dev/docs/adding-typescript/>

**Typescript configuration**

After installation, the devDependencies section of the package.json contains the typescript reference. Note that after installing a tsconfig.json file is created at the root of the directory and react-app-config.d.ts file is created in /src folder. These files contain rules for compiling Typescipt. There is more on these files in the resources section at the end of this document.

**Material UI**

The Material UI data grid provides a relatively simple way to display, add, update and remove data in a grid and is used in this example:

    npm i @mui/x-data-grid (see https://www.npmjs.com/package/@mui/x-data-grid)

Also, the Material UI Stack, Button and Box components are used:

    npm install @mui/material @emotion/react @emotion/styled (see https://www.npmjs.com/package/@mui/material )

More information on the Material UI data grid is provided in the resources at the end of this document.

**ESlint and Prettier**

ESlint is used in order to support detecting code problems according to rules including those for react and typescript. After installation of the create react app with typescript, eslint is included in the package.json file. Prettier is installed by default with the create-react-app but it is recommended for code formatting rather than ESlint. There is more on installing and configuring ESlint along with Prettier at the end of this document.

## Implementing the project

The project is setup as a simplified demo of a typical application that loads and displays data via an API and manages changes to that data using React context. There are 3 directories under the src directory: data, types, context, components and utils.

**Data and Data Model**

Under src, add the following folder structure and files:
    data/  
        TaskData.ts
        TaskHelper.ts
    types/
        ToDoModel.ts
    utils/
        Util.ts

TaskData contains json data that is loaded asynchronously using the loadTasksFromData function in TaskHelper, similar to a real-world application loading data from an API. ToDoModel.ts contains the data structures to be referenced throughout the application.

Add the following in ToDoModel.ts:

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

The initialTaskState object uses the Task interface when a Task is initialized. Note that the names and types of fields must be consistent with those in the Task, and these may be "undefined" at the time of initialization.

Add the following code to Util.ts.

export const getRandomInt = (max: number): number => {
    return Math.floor(Math.random() * max);
};

Add the following to TaskData.ts:

import { Status } from "../types/ToDoModel";
import { getRandomInt } from "../utils/Util";

export default [
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

This defines two tasks that are loaded when the application is run.

Add the following to TaskHelper.ts:

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
            return Promise.resolve(data).then((items) => {
            dispatch(tasksLoaded(items));
            });
        } catch (e) {
            dispatch(error());
        }
    };

This imports the task data and also the actions to be dispatched when loading data (There is more on the context and reducer files below). Note the parameter and return type of the load function. The parameter is a Dispatch object of type ToDoActions, followed by the return type of Promise<void>. Since the action of loading the data is dispatched to the reducer in this function, the load method itself returns an empty Promise object. In the function, an action of loadTasks type is dispatched to listeners indicating the loading of data has begun. Inside the try/catch, after the Promise is resolved, the data is dispatched to the reducer with the action of type tasksLoaded and the task data parameter. If an error occurs during loading, an error action is dispatched.

**Context**

Under src, add the following folder and files:

    context/
        ToDoContext.tsx
        ToDoReducer.tsx

In ToDoReducer, add the following:

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
    }

    export const initialToDoState: ToDoState = {
        tasks: [],
        tasksLoaded: false,
        tasksLoading: false,
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
            return { ...state, tasksLoading: false, tasksLoaded: false };

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

This manages the changes in state in the application. All data state changes are encapsulated in the ToDoReducer. ToDoActions defines the type for each action: loadTasks, tasksLoaded, addTask, updateTask, removeTasks and error. The ToDoReducer receives a parameter of type ToDoActions and state of type ToDoState, and updates the Tasks as well as tasksLoaded, tasksLoading and error properties. Components that subscribe to the context receive updates of the ToDoState following the state changes from the reducer.

In the ToDoContext, add the following:

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

    const ToDoContext = createContext<ToDoContextType>({
        state: initialToDoState,
        dispatch: () => undefined,
    });

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

The ToDoContextType contains the types of ToDoState and ToDoActions required for subscribers to the context. The useToDoContext and useToDoDispatch wrap the useContext method which takes the parameter of the ToDoContext. The ToDoContext instance of the ToDoContextType is initialized with the initialToDoState and an undefined dispatch object.
Components using the context must subscribe using the ToDoProvider, which receives a children parameter of type React.Node and returns a JSX.Element type containing the ToDoContext.Provider and the children. This wraps the calls to the useReducer to simplify the process of subscribing to the state and dispatching actions.

**Components**

Under src, add the following folder structure and files:

    components/
        ToDo/
            ToDo.tsx
            TaskList.css
        TaskList/
            TaskList.tsx
            TaskList.css

Add the following in ToDo.tsx:

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

This is the parent component for the TaskList. The ToDoProvider element that contains the TaskList is required to subscribe to state and reducer for managing tasks.

Add the following to the ToDo.css:

    Header {
        justify-content: center;
        text-align: center;
    }

    .ContentArea {
        border: 1px solid white;
    }

    .MainContentArea {
        width: 70%;
        margin: auto;
        border-left: 1px solid white;
        border-right: 1px solid white;
        overflow: auto;
        padding: 20px;
    }

In TaskList.tsx add the following:

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
            }, [loadTasksFromData]);

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
                width: 150,
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

TaskList.tsx contains references to the state and dispatch through the useToDoDispatch() and useToDoContext(). Tasks are first loaded in the useEffect by passing a reference of the dispatch to the loadTasksfromData function. The data grid has a rows property which is set to the tasks, and the columns are defined for each row property for the Task type. Once data is loaded without error, the state tasksLoaded property is checked and the Tasks are loaded in the data grid.

Following user events, actions are dispatched for addTask,updateTask and removeTasks. When "Add a Task" is clicked, the handleAddRow creates a Task with a random id with the initial Task state and dispatches the addTask action with the parameter of the new Task. The ToDoReducer recieves the action, checks the type and updates the state with the payload received.

Changes in the data grid UI are managed through the onSelectionModelChange event and the local selection model use state of the data grid. The handleCommit event for the data grid takes a parameter of type GridCellEditCommitParams, checks the field that is being updated, updates the item in the state tasks, then dispatches the updated task to the reducer. The handleDeleteRows uses the checkbox selection property of the data grid. The selectionModel contains an array of selected items, each with a gridRowId property. An array of the deletedIds is sent as a parameter when the removeTasks action is sent to the dispatch.

Add the following to TaskList.css:

    .TaskList {
    padding: 20px;
    display: flex;
    flex-direction: column;
    }

The last step is to replace the content of App.tsx with the following:

    import "./App.css";
    import React from "react";
    import ToDo from "./components/ToDo/ToDo";

    function App(): JSX.Element {
    return (

    <div className="App">
    <ToDo />
    </div>
    );
    }

    export default App;

**Run the app!**

You should able to run the app with npm start without error. Click to add a Task, edit the fields and the state is automatically updated, and select a task or tasks to delete.

## Resources

**React state management using useContext and useReducer compared to react-redux**
 
 While useContext and useReducer allow developers direct control and management of state, it may not perform as well as react-redux in larger, more complex applications.  React-redux better manages subscription updates to only the specific data needed in the subscribing components, where Context can cause entire page refreshing . React-redux also has browser tools for debugging and viewing state changes.

Here are a couple of interesting links with more info on this topic: 

https://www.imaginarycloud.com/blog/react-hooks-vs-redux/
https://stackoverflow.com/questions/67830857/redux-vs-context-api-and-usereducer-hook

**useReducer and useContext**

There are a number of references to React state management with useContext and useReducer. These are references from React org to provide further detail on the use of useReducer and useContext:

useReducer: <https://reactjs.org/docs/hooks-reference.html#usereducer>
useContext: <https://reactjs.org/docs/hooks-reference.html#usecontext>

**Typescript configuration**

Compile-time Typescript error messages are a useful too for resolving bugs but can be a challenge in the beginning. Fortunately, there are extensive resources for understanding Typescript errors, adopting Typescript, as well as Typescript configuration in the official documentation here: <https://www.typescriptlang.org/>

**Tsconfig file**

The tsconfig contains the rules to be provided to Typescript when compiling. Below are a few of the key settings in the tsconfig.json file. There are many options that can be set for how the tsc compiler works. There is more on the tsconfig documentation here: <https://www.typescriptlang.org/docs/handbook/tsconfig-json.html>.

Files/Include: These are the files to be compiled by Typescript. By default in the create-react-app, the "include" setting includes all files under the src folder. Target version: This is version of javascript for the output files from the compiler. By default, in the create-react-app, this is es5. This value should be consistent with overall browser support for javascript in your app.

Strict property: This flag determines how strictly Typescipt will enforce rules for program correctness. By default this is on, but there are situations where an existing application is being converted to use javascript and you may not want to have more control of how strictly Typescript settings are applied. There is more info here: <https://www.typescriptlang.org/tsconfig#strict>

**.d.ts file**

After compiling, a .d.ts file is generated which contains the typescript. Note that .d.ts files don't contain implementation, only declarations and only contain publicly accessible types. The use case for this is for distributed libraries. A deeper explanation can be found here: <https://stackoverflow.com/questions/50463990/what-are-d-ts-files-for#50464124>

**Manually installing eslint**

Rather than relying on create-react-app, you can manually install ESlint to have more control of how it is implemented using npm eslint --init . You will be prompted for configuation settings based on your project and eslintrc config file should be created. If you install ESlint manually, it is recommended to not select the option for using it for code formatting. Prettier is a better option for code formatting.

Here are a few resources for installing and configuring ESLint:
https://www.youtube.com/watch?v=5IGVeq2DdsA
https://thomaslombart.com/setup-eslint-prettier-react
https://www.geeksforgeeks.org/how-to-configure-eslint-for-react-projects/

**Prettier condiguration**

Prettier can be configured to run at the project level or automatically on save within VS Code. Also, assuming you are using Visual Studio Code as an editor, extensions can be installed to run ESLint and prettier on save. More information can be found the Prettier documentation:

https://prettier.io/docs/en/install.html

**Material UI configuration**

The Material UI data grid has extensice documentation and many configuration options. More information can be found in the official documentation: https://mui.com/components/data-grid/.
