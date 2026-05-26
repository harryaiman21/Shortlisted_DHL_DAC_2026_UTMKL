# TaskItemArgument

`UiPath.GSuite.Activities.Tasks.Models.TaskItemArgument`

A composition component used by Google Tasks activities that require a specific task (not just a task list). Extends [ListOrTaskItemArgument](ListOrTaskItemArgument.md) with stricter validation that ensures a task is identified, not just a list.

**Assembly:** `UiPath.GSuite.Activities`
**Inherits:** [`ListOrTaskItemArgument`](ListOrTaskItemArgument.md)

## InputMode (`EDriveItemMode`)

Same as [ListOrTaskItemArgument](ListOrTaskItemArgument.md).

| Mode | Value | Description | AI-XAML Suitable |
|------|-------|-------------|------------------|
| `Browse` | `0` | Select a task from the remote browser in Studio. | **Not suitable for AI-generated XAML** -- requires interactive Studio UI. |
| `UrlOrId` | `1` | Manually enter both list ID and task ID. | Yes |
| `UseExisting` | `2` | Use an existing [GTask](../types/GTask.md) variable. | Yes |
| `FullPath` | `3` | Enter the absolute path (e.g., "My list/first task"). | Yes |

## Properties

All properties are inherited from [ListOrTaskItemArgument](ListOrTaskItemArgument.md). See that document for the full property list.

## XAML Examples

### UrlOrId Mode

```xml
<TaskItemArgument InputMode="UrlOrId">
  <TaskItemArgument.ListId>
    <InArgument x:TypeArguments="x:String">list-id-123</InArgument>
  </TaskItemArgument.ListId>
  <TaskItemArgument.TaskId>
    <InArgument x:TypeArguments="x:String">task-id-456</InArgument>
  </TaskItemArgument.TaskId>
</TaskItemArgument>
```

### UseExisting Mode

```xml
<TaskItemArgument InputMode="UseExisting">
  <TaskItemArgument.ListOrTask>
    <InArgument x:TypeArguments="tasks:ITaskItem">[MyTaskVariable]</InArgument>
  </TaskItemArgument.ListOrTask>
</TaskItemArgument>
```

### FullPath Mode

```xml
<TaskItemArgument InputMode="FullPath">
  <TaskItemArgument.FullPath>
    <InArgument x:TypeArguments="x:String">My Tasks/Buy groceries</InArgument>
  </TaskItemArgument.FullPath>
</TaskItemArgument>
```

## Notes

- Unlike [ListOrTaskItemArgument](ListOrTaskItemArgument.md), this component validates that **both** a list ID and a task ID are provided in `UrlOrId` mode, and that a `TaskBrowserId` is present in `Browse` mode.
- In `UseExisting` mode, the provided variable should be a [GTask](../types/GTask.md) (not a [GTaskList](../types/GTaskList.md)).

## Used By

Google Tasks activities that operate on a specific task -- see activity docs for details.
