# New Folder Created

`UiPath.GSuite.Activities.Drive.Triggers.NewFolderCreated`

Trigger activity that fires when a new folder is created in Google Drive.

**Package:** `UiPath.GSuite.Activities`
**Category:** Drive
**Connector:** `uipath-google-drive`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `BrowserLocation` | Folder | `Property` | `string` | No | | The parent folder ID to monitor, selected via browser. |
| `LocationFriendlyName` | Folder Name | `Property` | `string` | No | | Folder friendly name, when browsing. |
| `DriveId` | Drive ID | `Property` | `string` | No | | The drive ID. Present if the folder is in a shared drive. |
| `Filter` | Filter | `Property` | `TriggerFolderFilterCollection` | No | | Conditions to filter which folder creation events to respond to. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google Workspace connection to use. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `Result` | Folder | `OutArgument` | [`GDriveRemoteItem`](types/GDriveRemoteItem.md) | The newly created folder. |
| `JobData` | Job Data | `OutArgument` | `JobInformation` | Metadata about the triggering job. |

## Output Model

Returns a [`GDriveRemoteItem`](types/GDriveRemoteItem.md) with folder ID, name, URL, MIME type, dates, and size.

## XAML Example

```xml
<driveTriggers:NewFolderCreated
    DisplayName="New Folder Created"
    ConnectionId="[myConnection]"
    Result="[newFolder]"
    JobData="[jobData]"
    xmlns:driveTriggers="clr-namespace:UiPath.GSuite.Activities.Drive.Triggers;assembly=UiPath.GSuite.Activities" />
```

## Notes

- This is a trigger activity used in trigger-based workflows.
- The parent folder is selected via a `TriggerDriveItemArgument` (Browse mode only), configured through the Studio designer.
- Uses `ObjectName` of `Folder` to filter for folder-specific events.
- Requires a Google Workspace connection with Drive scope.
