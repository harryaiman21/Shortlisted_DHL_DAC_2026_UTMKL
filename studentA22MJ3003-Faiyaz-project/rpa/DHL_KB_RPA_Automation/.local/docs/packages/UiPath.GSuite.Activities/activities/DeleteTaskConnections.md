# Delete Task

`UiPath.GSuite.Activities.DeleteTaskConnections`

Deletes a Google Task from a task list.

**Package:** `UiPath.GSuite.Activities`
**Category:** Tasks
**Connector:** `uipath-google-tasks`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | Task | `Property` | [`TaskItemArgument`](components/TaskItemArgument.md) | Yes | | The task to delete. See [TaskItemArgument](components/TaskItemArgument.md) for input modes. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google Workspace connection to use. |

## XAML Example

```xml
<gsuite:DeleteTaskConnections
    DisplayName="Delete Task"
    ConnectionId="[myConnection]">
    <gsuite:DeleteTaskConnections.Item>
        <models:TaskItemArgument InputMode="UseExisting">
            <models:TaskItemArgument.ListOrTask>
                <InArgument x:TypeArguments="tasks:ITaskItem">[existingTask]</InArgument>
            </models:TaskItemArgument.ListOrTask>
        </models:TaskItemArgument>
    </gsuite:DeleteTaskConnections.Item>
</gsuite:DeleteTaskConnections>
```

## Notes

- This activity targets a specific task (not a task list). A [`TaskItemArgument`](components/TaskItemArgument.md) is used, requiring both `ListId` and `TaskId` in `UrlOrId` mode.
- The default `TaskInputMode` is `UseExisting`.
- If a [`GTaskList`](types/GTaskList.md) object is passed instead of a [`GTask`](types/GTask.md), the activity throws an error because it cannot delete a task list.
- This activity has no output properties.
