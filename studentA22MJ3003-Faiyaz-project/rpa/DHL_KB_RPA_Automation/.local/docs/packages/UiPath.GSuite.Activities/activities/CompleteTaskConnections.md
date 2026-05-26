# Complete Task

`UiPath.GSuite.Activities.CompleteTaskConnections`

Marks a Google Task as completed.

**Package:** `UiPath.GSuite.Activities`
**Category:** Tasks
**Connector:** `uipath-google-tasks`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | Task | `Property` | [`TaskItemArgument`](components/TaskItemArgument.md) | Yes | | The task to mark as completed. See [TaskItemArgument](components/TaskItemArgument.md) for input modes. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google Workspace connection to use. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `CompletedTask` | Completed Task | `OutArgument` | [`GTask`](types/GTask.md) | The task after being marked as completed. |

## Output Model

Returns a [`GTask`](types/GTask.md) with updated status and completion date.

## XAML Example

```xml
<gsuite:CompleteTaskConnections
    DisplayName="Complete Task"
    ConnectionId="[myConnection]"
    CompletedTask="[completedTask]">
    <gsuite:CompleteTaskConnections.Item>
        <models:TaskItemArgument InputMode="UseExisting">
            <models:TaskItemArgument.ListOrTask>
                <InArgument x:TypeArguments="tasks:ITaskItem">[existingTask]</InArgument>
            </models:TaskItemArgument.ListOrTask>
        </models:TaskItemArgument>
    </gsuite:CompleteTaskConnections.Item>
</gsuite:CompleteTaskConnections>
```

## Notes

- This activity targets a specific task (not a task list). A [`TaskItemArgument`](components/TaskItemArgument.md) is used, requiring both `ListId` and `TaskId` in `UrlOrId` mode.
- The default `TaskInputMode` is `UseExisting`.
- If a [`GTaskList`](types/GTaskList.md) object is passed instead of a [`GTask`](types/GTask.md), the activity throws an error because it cannot complete a task list.
