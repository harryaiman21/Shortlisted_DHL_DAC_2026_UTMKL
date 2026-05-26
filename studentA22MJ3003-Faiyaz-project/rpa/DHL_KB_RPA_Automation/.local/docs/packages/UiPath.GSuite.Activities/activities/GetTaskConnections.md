# Get Task

`UiPath.GSuite.Activities.GetTaskConnections`

Retrieves a single Google Task by its identifier, optionally including its subtasks.

**Package:** `UiPath.GSuite.Activities`
**Category:** Tasks
**Connector:** `uipath-google-tasks`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | Task | `Property` | [`TaskItemArgument`](components/TaskItemArgument.md) | Yes | | The task to retrieve. See [TaskItemArgument](components/TaskItemArgument.md) for input modes. |
| `IncludeSubtasks` | Include Subtasks | `InArgument` | `Boolean` | No | `false` | Specify whether to include subtasks or not. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google Workspace connection to use. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `ResultTask` | Task | `OutArgument` | [`GTask`](types/GTask.md) | The retrieved task. |

## Output Model

Returns a [`GTask`](types/GTask.md) with task ID, title, details, status, due date, and other task metadata.

## XAML Example

```xml
<gsuite:GetTaskConnections
    DisplayName="Get Task"
    ConnectionId="[myConnection]"
    IncludeSubtasks="True"
    ResultTask="[retrievedTask]">
    <gsuite:GetTaskConnections.Item>
        <models:TaskItemArgument InputMode="UrlOrId">
            <models:TaskItemArgument.ListId>
                <InArgument x:TypeArguments="x:String">[taskListId]</InArgument>
            </models:TaskItemArgument.ListId>
            <models:TaskItemArgument.TaskId>
                <InArgument x:TypeArguments="x:String">[taskId]</InArgument>
            </models:TaskItemArgument.TaskId>
        </models:TaskItemArgument>
    </gsuite:GetTaskConnections.Item>
</gsuite:GetTaskConnections>
```

## Notes

- This activity targets a specific task (not a task list). A [`TaskItemArgument`](components/TaskItemArgument.md) is used, requiring both `ListId` and `TaskId` in `UrlOrId` mode.
- If a [`GTaskList`](types/GTaskList.md) object is passed instead of a [`GTask`](types/GTask.md), the activity throws an error because it cannot retrieve a task list as a task.
