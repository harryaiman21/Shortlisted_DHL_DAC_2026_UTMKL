# Get Task List

`UiPath.GSuite.Activities.GetTaskListConnections`

Retrieves a single Google Task List by its identifier.

**Package:** `UiPath.GSuite.Activities`
**Category:** Tasks
**Connector:** `uipath-google-tasks`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Identifier` | Identifier | `InArgument` | `String` | Yes | | The task list identifier (ID or base64-encoded task list object). |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google Workspace connection to use. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `TaskList` | Task List | `OutArgument` | [`GTaskList`](types/GTaskList.md) | The retrieved task list. |

## Output Model

Returns a [`GTaskList`](types/GTaskList.md) with list ID, title, URL, and last modified date.

## XAML Example

```xml
<gsuite:GetTaskListConnections
    DisplayName="Get Task List"
    ConnectionId="[myConnection]"
    Identifier="[taskListId]"
    TaskList="[retrievedTaskList]" />
```

## Notes

- This activity does not use [`ListOrTaskItemArgument`](components/ListOrTaskItemArgument.md). It takes a simple string identifier.
- The `Identifier` can be a task list ID string or a base64-encoded `GTaskListSlim` object.
