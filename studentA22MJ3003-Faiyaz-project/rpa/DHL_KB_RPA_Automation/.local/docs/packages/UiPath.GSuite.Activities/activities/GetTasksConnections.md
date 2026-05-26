# Get Tasks

`UiPath.GSuite.Activities.GetTasksConnections`

Gets a list of tasks/subtasks from a Google Task List or a specific parent task. Supports filtering by title, details, due date, and completed date.

**Package:** `UiPath.GSuite.Activities`
**Category:** Tasks
**Connector:** `uipath-google-tasks`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | Task List or Parent Task | `Property` | [`ListOrTaskItemArgument`](components/ListOrTaskItemArgument.md) | Yes | | The task list or parent task to retrieve tasks from. See [ListOrTaskItemArgument](components/ListOrTaskItemArgument.md) for input modes. |
| `IncludeSubtasks` | Include Subtasks | `InArgument` | `Boolean` | No | `false` | Whether to include subtasks in the results. When false, only top-level tasks are returned. |
| `IncludeCompleted` | Include Completed | `InArgument` | `Boolean` | No | `false` | Whether to include completed tasks in the results. |
| `MaxResults` | Max Results | `InArgument` | `Int32` | No | `100` | The maximum number of tasks to return. |
| `Filter` | Filter | `Property` | [`TaskFilterCollection`](filtering/TaskFilterCollection.md) | No | | Indicates the filter conditions to be applied to the tasks retrieved. See [TaskFilterCollection](filtering/TaskFilterCollection.md) for criteria. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google Workspace connection to use. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `Tasks` | Tasks | `OutArgument` | `IEnumerable<`[`GTask`](types/GTask.md)`>` | The retrieved tasks. |

## Output Model

Returns a collection of [`GTask`](types/GTask.md) objects.

## XAML Example

```xml
<gsuite:GetTasksConnections
    DisplayName="Get Tasks"
    ConnectionId="[myConnection]"
    IncludeCompleted="False"
    MaxResults="[100]"
    Tasks="[taskList]">
    <gsuite:GetTasksConnections.Item>
        <models:ListOrTaskItemArgument InputMode="UrlOrId">
            <models:ListOrTaskItemArgument.ListId>
                <InArgument x:TypeArguments="x:String">[taskListId]</InArgument>
            </models:ListOrTaskItemArgument.ListId>
        </models:ListOrTaskItemArgument>
    </gsuite:GetTasksConnections.Item>
</gsuite:GetTasksConnections>
```

## Notes

- When `IncludeSubtasks` is false (default), only top-level tasks (those without a parent) are returned.
- When a specific task is selected (via `TaskId` or a [`GTask`](types/GTask.md) object), only the subtasks of that task are returned.
- The default `MaxResults` is 100.
- Use the `Filter` property to narrow results. See [`TaskFilterCollection`](filtering/TaskFilterCollection.md) for available filter criteria.
