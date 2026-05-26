# Wait For Task Created and Resume

`UiPath.GSuite.Activities.WaitForTaskCreated`

Pauses the workflow and resumes when a new Google Task is created.

**Package:** `UiPath.GSuite.Activities`
**Category:** Tasks
**Connector:** `uipath-google-tasks`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `ListItemArgument` | Task List | `Property` | [`ListOrTaskItemArgument`](components/ListOrTaskItemArgument.md) | Yes | | The task list to monitor for new tasks. See [ListOrTaskItemArgument](components/ListOrTaskItemArgument.md) for input modes. |
| `Filter` | Filter | `Property` | `TriggerTaskFilterWithVariablesCollection` | No | | Filter conditions to match newly created tasks. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google Workspace connection to use. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `Result` | Task | `OutArgument` | [`GTask`](types/GTask.md) | The newly created task. |
| `JobData` | Job Data | `OutArgument` | `JobInformation` | Details about the currently executing job. |

## Output Model

Returns a [`GTask`](types/GTask.md) representing the task that was created.

## XAML Example

```xml
<gsuite:WaitForTaskCreated
    DisplayName="Wait for Task Created"
    ConnectionId="[myConnection]"
    Result="[newTask]"
    JobData="[jobInfo]">
    <gsuite:WaitForTaskCreated.ListItemArgument>
        <models:ListOrTaskItemArgument InputMode="UrlOrId">
            <models:ListOrTaskItemArgument.ListId>
                <InArgument x:TypeArguments="x:String">[taskListId]</InArgument>
            </models:ListOrTaskItemArgument.ListId>
        </models:ListOrTaskItemArgument>
    </gsuite:WaitForTaskCreated.ListItemArgument>
</gsuite:WaitForTaskCreated>
```

## Notes

- This is a persistence activity -- the workflow suspends and resumes when the trigger condition is met.
- The activity first creates an inbox subscription, then persists. On resume, it retrieves the newly created task details.
- In debug mode, the activity attempts to find a sample matching created task instead of persisting.
