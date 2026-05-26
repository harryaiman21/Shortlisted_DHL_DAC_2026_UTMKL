# Wait For Task Completed and Resume

`UiPath.GSuite.Activities.WaitForTaskCompleted`

Pauses the workflow and resumes when a Google Task is marked as completed.

**Package:** `UiPath.GSuite.Activities`
**Category:** Tasks
**Connector:** `uipath-google-tasks`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `ListItemArgument` | Task List | `Property` | [`ListOrTaskItemArgument`](components/ListOrTaskItemArgument.md) | Yes | | The task list to monitor for completed tasks. See [ListOrTaskItemArgument](components/ListOrTaskItemArgument.md) for input modes. |
| `Filter` | Filter | `Property` | `TriggerTaskFilterWithVariablesCollection` | No | | Filter conditions to match completed tasks. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google Workspace connection to use. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `Result` | Task | `OutArgument` | [`GTask`](types/GTask.md) | The completed task. |
| `JobData` | Job Data | `OutArgument` | `JobInformation` | Details about the currently executing job. |

## Output Model

Returns a [`GTask`](types/GTask.md) representing the task that was completed.

## XAML Example

```xml
<gsuite:WaitForTaskCompleted
    DisplayName="Wait for Task Completed"
    ConnectionId="[myConnection]"
    Result="[completedTask]"
    JobData="[jobInfo]">
    <gsuite:WaitForTaskCompleted.ListItemArgument>
        <models:ListOrTaskItemArgument InputMode="UrlOrId">
            <models:ListOrTaskItemArgument.ListId>
                <InArgument x:TypeArguments="x:String">[taskListId]</InArgument>
            </models:ListOrTaskItemArgument.ListId>
        </models:ListOrTaskItemArgument>
    </gsuite:WaitForTaskCompleted.ListItemArgument>
</gsuite:WaitForTaskCompleted>
```

## Notes

- This is a persistence activity -- the workflow suspends and resumes when the trigger condition is met.
- The activity first creates an inbox subscription, then persists. On resume, it retrieves the completed task details.
- In debug mode, the activity attempts to find a sample matching completed task instead of persisting.
