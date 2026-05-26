# Create Task

`UiPath.GSuite.Activities.CreateTaskConnections`

Creates a new Google Task in the specified task list. Optionally, specify a parent task to create a subtask.

**Package:** `UiPath.GSuite.Activities`
**Category:** Tasks
**Connector:** `uipath-google-tasks`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | Task List or Parent Task | `Property` | [`ListOrTaskItemArgument`](components/ListOrTaskItemArgument.md) | Yes | | The task list to create the task in, or a parent task to create a subtask under. See [ListOrTaskItemArgument](components/ListOrTaskItemArgument.md) for input modes. |
| `Title` | Title | `InArgument` | `String` | Yes | | The task title. |
| `Description` | Description | `InArgument` | `String` | No | | The task details/notes. |
| `DueDate` | Due Date | `InArgument` | `DateTime?` | No | | The due date of the task. |
| `Status` | Status | `InArgument` | [`GTaskStatus`](#gtaskstatus) | No | `NeedsAction` | The status of the task. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google Workspace connection to use. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `Result` | Task | `OutArgument` | [`GTask`](types/GTask.md) | The created task. |

## Output Model

Returns a [`GTask`](types/GTask.md) with task ID, title, details, status, due date, and other task metadata.

## Enum Reference

### `GTaskStatus`

| Value | Description |
|-------|-------------|
| `NeedsAction` | The task is not yet completed (default). |
| `Completed` | The task has been marked as completed. |

## XAML Example

```xml
<gsuite:CreateTaskConnections
    DisplayName="Create Task"
    ConnectionId="[myConnection]"
    Title="[taskTitle]"
    Description="[taskDetails]"
    DueDate="[dueDate]"
    Status="[GTaskStatus.NeedsAction]"
    Result="[newTask]">
    <gsuite:CreateTaskConnections.Item>
        <models:ListOrTaskItemArgument InputMode="UrlOrId">
            <models:ListOrTaskItemArgument.ListId>
                <InArgument x:TypeArguments="x:String">[taskListId]</InArgument>
            </models:ListOrTaskItemArgument.ListId>
        </models:ListOrTaskItemArgument>
    </gsuite:CreateTaskConnections.Item>
</gsuite:CreateTaskConnections>
```

## Notes

- The `Title` property is required and will cause a validation error if not set.
- When using `UrlOrId` mode, `ListId` is required. `TaskId` is optional and used to create a subtask under a parent task.
- The default `Status` is `NeedsAction`.
