# Delete Task List

`UiPath.GSuite.Activities.DeleteTaskListConnections`

Deletes a Google Task List and all its tasks.

**Package:** `UiPath.GSuite.Activities`
**Category:** Tasks
**Connector:** `uipath-google-tasks`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | Task List | `Property` | [`ListOrTaskItemArgument`](components/ListOrTaskItemArgument.md) | Yes | | The task list to delete. See [ListOrTaskItemArgument](components/ListOrTaskItemArgument.md) for input modes. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google Workspace connection to use. |

## XAML Example

```xml
<gsuite:DeleteTaskListConnections
    DisplayName="Delete Task List"
    ConnectionId="[myConnection]">
    <gsuite:DeleteTaskListConnections.Item>
        <models:ListOrTaskItemArgument InputMode="UseExisting">
            <models:ListOrTaskItemArgument.ListOrTask>
                <InArgument x:TypeArguments="tasks:ITaskItem">[existingTaskList]</InArgument>
            </models:ListOrTaskItemArgument.ListOrTask>
        </models:ListOrTaskItemArgument>
    </gsuite:DeleteTaskListConnections.Item>
</gsuite:DeleteTaskListConnections>
```

## Notes

- This activity targets a task list (not an individual task). A [`ListOrTaskItemArgument`](components/ListOrTaskItemArgument.md) is used, requiring only `ListId` in `UrlOrId` mode.
- The default `TaskInputMode` is `UseExisting`.
- If a [`GTask`](types/GTask.md) object is passed instead of a [`GTaskList`](types/GTaskList.md), the activity throws an error because it expects a task list, not a task.
- Deleting a task list also permanently deletes all tasks within it.
- This activity has no output properties.
