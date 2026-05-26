# Update Task

`UiPath.GSuite.Activities.UpdateTaskConnections`

Updates an existing Google Task's properties such as title, description, due date, or status.

**Package:** `UiPath.GSuite.Activities`
**Category:** Tasks
**Connector:** `uipath-google-tasks`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | Task | `Property` | [`TaskItemArgument`](components/TaskItemArgument.md) | Yes | | The task to update. See [TaskItemArgument](components/TaskItemArgument.md) for input modes. |
| `Title` | Title | `InArgument` | `String` | No | | The updated title of the task. |
| `Description` | Description | `InArgument` | `String` | No | | The updated description/notes for the task. |
| `DueDate` | Due Date | `InArgument` | `DateTime?` | No | | The updated due date of the task. |
| `Status` | Status | `InArgument` | [`GTaskStatus`](#gtaskstatus) | No | | The updated status of the task. Only applied if explicitly set. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google Workspace connection to use. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `Result` | Task | `OutArgument` | [`GTask`](types/GTask.md) | The updated task. |

## Output Model

Returns a [`GTask`](types/GTask.md) with updated task properties.

## Enum Reference

### `GTaskStatus`

| Value | Description |
|-------|-------------|
| `NeedsAction` | The task is not yet completed. |
| `Completed` | The task has been marked as completed. |

## XAML Example

```xml
<gsuite:UpdateTaskConnections
    DisplayName="Update Task"
    ConnectionId="[myConnection]"
    Title="[updatedTitle]"
    Status="[GTaskStatus.Completed]"
    Result="[updatedTask]">
    <gsuite:UpdateTaskConnections.Item>
        <models:TaskItemArgument InputMode="UseExisting">
            <models:TaskItemArgument.ListOrTask>
                <InArgument x:TypeArguments="tasks:ITaskItem">[existingTask]</InArgument>
            </models:TaskItemArgument.ListOrTask>
        </models:TaskItemArgument>
    </gsuite:UpdateTaskConnections.Item>
</gsuite:UpdateTaskConnections>
```

## Notes

- This activity targets a specific task (not a task list). A [`TaskItemArgument`](components/TaskItemArgument.md) is used, requiring both `ListId` and `TaskId` in `UrlOrId` mode.
- The default `TaskInputMode` is `UseExisting`.
- If a [`GTaskList`](types/GTaskList.md) object is passed instead of a [`GTask`](types/GTask.md), the activity throws an error because it cannot update a task list.
- The `Status` property is only applied if its expression is explicitly set.
