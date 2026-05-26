# Wait For Folder Created

`UiPath.GSuite.Activities.WaitForFolderCreated`

Pauses the workflow until a new folder matching the specified filter is created in Google Drive.

**Package:** `UiPath.GSuite.Activities`
**Category:** Drive
**Connector:** `uipath-google-drive`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `DriveItemArgument` | Folder | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | No | | The parent folder to monitor for new folder creation. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |
| `Filter` | Filter | `Property` | `TriggerFileFilterWithVariablesCollection` | No | | Conditions to filter which folder creation events to respond to. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google Workspace connection to use. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `Result` | Folder | `OutArgument` | [`GDriveRemoteItem`](types/GDriveRemoteItem.md) | The newly created folder that triggered the wait. |
| `JobData` | Job Data | `OutArgument` | `JobInformation` | Metadata about the job that triggered this activity. |

## Output Model

Returns a [`GDriveRemoteItem`](types/GDriveRemoteItem.md) with folder ID, name, URL, MIME type, dates, and size.

## XAML Example

```xml
<gsuite:WaitForFolderCreated
    DisplayName="Wait For Folder Created"
    ConnectionId="[myConnection]"
    Result="[newFolder]"
    JobData="[jobData]">
    <gsuite:WaitForFolderCreated.DriveItemArgument>
        <models:DriveItemArgument InputMode="UrlOrId">
            <models:DriveItemArgument.IdOrUrl>
                <InArgument x:TypeArguments="x:String">[parentFolderId]</InArgument>
            </models:DriveItemArgument.IdOrUrl>
        </models:DriveItemArgument>
    </gsuite:WaitForFolderCreated.DriveItemArgument>
</gsuite:WaitForFolderCreated>
```

## Notes

- This is a persistence activity -- the workflow suspends and resumes when the trigger condition is met.
- Uses `ObjectName` of `Folder` to filter for folder creation events only.
- Requires a Google Workspace connection with Drive scope.
