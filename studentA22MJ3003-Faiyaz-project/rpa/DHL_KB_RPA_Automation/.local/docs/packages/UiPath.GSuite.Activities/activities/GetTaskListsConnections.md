# Get Task Lists

`UiPath.GSuite.Activities.GetTaskListsConnections`

Gets all Google Task Lists assigned to the authenticated user. Supports filtering by title.

**Package:** `UiPath.GSuite.Activities`
**Category:** Tasks
**Connector:** `uipath-google-tasks`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Filter` | Filter | `Property` | [`TaskListFilterCollection`](filtering/TaskListFilterCollection.md) | No | | Indicates the filter conditions to be applied to the task lists retrieved. See [TaskListFilterCollection](filtering/TaskListFilterCollection.md) for criteria. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google Workspace connection to use. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `TaskLists` | Task Lists | `OutArgument` | `IEnumerable<`[`GTaskList`](types/GTaskList.md)`>` | The retrieved task lists. |

## Output Model

Returns a collection of [`GTaskList`](types/GTaskList.md) objects.

## XAML Example

```xml
<gsuite:GetTaskListsConnections
    DisplayName="Get Task Lists"
    ConnectionId="[myConnection]"
    TaskLists="[allTaskLists]" />
```

## Notes

- This activity does not use [`ListOrTaskItemArgument`](components/ListOrTaskItemArgument.md). It retrieves all task lists for the authenticated user.
- Use the `Filter` property to narrow results by title. See [`TaskListFilterCollection`](filtering/TaskListFilterCollection.md) for available filter criteria.
