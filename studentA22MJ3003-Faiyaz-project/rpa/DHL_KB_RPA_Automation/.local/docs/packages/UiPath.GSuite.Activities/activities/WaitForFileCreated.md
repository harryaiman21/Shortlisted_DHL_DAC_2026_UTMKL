# Wait For File Created

`UiPath.GSuite.Activities.WaitForFileCreated`

Pauses the workflow until a new file matching the specified filter is created in a Google Drive folder.

**Package:** `UiPath.GSuite.Activities`
**Category:** Drive
**Connector:** `uipath-google-drive`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `DriveItemArgument` | Folder | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | No | | The folder to monitor for new files. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |
| `Filter` | Filter | `Property` | `TriggerFileFilterWithVariablesCollection` | No | | Conditions to filter which file creation events to respond to. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google Workspace connection to use. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `Result` | File | `OutArgument` | [`GDriveRemoteItem`](types/GDriveRemoteItem.md) | The newly created file that triggered the wait. |
| `JobData` | Job Data | `OutArgument` | `JobInformation` | Metadata about the job that triggered this activity. |

## Output Model

Returns a [`GDriveRemoteItem`](types/GDriveRemoteItem.md) with file/folder ID, name, URL, MIME type, dates, and size.

## XAML Example

```xml
<gsuite:WaitForFileCreated
    DisplayName="Wait For File Created"
    ConnectionId="[myConnection]"
    Result="[newFile]"
    JobData="[jobData]">
    <gsuite:WaitForFileCreated.DriveItemArgument>
        <models:DriveItemArgument InputMode="UrlOrId">
            <models:DriveItemArgument.IdOrUrl>
                <InArgument x:TypeArguments="x:String">[folderId]</InArgument>
            </models:DriveItemArgument.IdOrUrl>
        </models:DriveItemArgument>
    </gsuite:WaitForFileCreated.DriveItemArgument>
</gsuite:WaitForFileCreated>
```

## Notes

- This is a persistence activity -- the workflow suspends and resumes when the trigger condition is met.
- Requires a Google Workspace connection with Drive scope.
