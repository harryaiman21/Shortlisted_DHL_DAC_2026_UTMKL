# Rename Task List

`UiPath.GSuite.Activities.RenameTaskListConnections`

Renames an existing Google Task List by updating its title.

**Package:** `UiPath.GSuite.Activities`
**Category:** Tasks
**Connector:** `uipath-google-tasks`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | Task List | `Property` | [`ListOrTaskItemArgument`](components/ListOrTaskItemArgument.md) | Yes | | The task list to rename. See [ListOrTaskItemArgument](components/ListOrTaskItemArgument.md) for input modes. |
| `Title` | Title | `InArgument` | `String` | Yes | | The new title for the task list. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google Workspace connection to use. |

## XAML Example

```xml
<gsuite:RenameTaskListConnections
    DisplayName="Rename Task List"
    ConnectionId="[myConnection]"
    Title="[newTitle]">
    <gsuite:RenameTaskListConnections.Item>
        <models:ListOrTaskItemArgument InputMode="UseExisting">
            <models:ListOrTaskItemArgument.ListOrTask>
                <InArgument x:TypeArguments="tasks:ITaskItem">[existingTaskList]</InArgument>
            </models:ListOrTaskItemArgument.ListOrTask>
        </models:ListOrTaskItemArgument>
    </gsuite:RenameTaskListConnections.Item>
</gsuite:RenameTaskListConnections>
```

## Notes

- This activity targets a task list (not an individual task). A [`ListOrTaskItemArgument`](components/ListOrTaskItemArgument.md) is used, requiring only `ListId` in `UrlOrId` mode.
- The default `TaskInputMode` is `UseExisting`.
- If a [`GTask`](types/GTask.md) object is passed instead of a [`GTaskList`](types/GTaskList.md), the activity throws an error because it expects a task list, not a task.
- This activity has no output properties.
