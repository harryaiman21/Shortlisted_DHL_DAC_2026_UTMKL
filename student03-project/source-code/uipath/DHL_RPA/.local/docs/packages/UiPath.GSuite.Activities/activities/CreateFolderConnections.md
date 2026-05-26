# Create Folder

`UiPath.GSuite.Activities.CreateFolderConnections`

Creates a new folder in Google Drive under a specified parent folder.

**Package:** `UiPath.GSuite.Activities`
**Category:** Drive
**Connector:** `uipath-google-drive`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | Parent Folder | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | No | | The parent folder where the new folder is created. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |
| `NewFolderName` | Folder Name | `InArgument` | `string` | Yes | | The name of the new folder. |
| `NewFolderDescription` | Description | `InArgument` | `string` | No | | Description of the new folder. |
| `ConflictResolution` | Conflict Resolution | `InArgument` | `ConflictBehavior` | No | `AddSeparate` | Behavior when a folder with the same name already exists. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google Workspace connection to use. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `Result` | Result | `OutArgument` | [`GDriveRemoteItem`](types/GDriveRemoteItem.md) | Reference to the newly created folder. |

## Output Model

Returns a [`GDriveRemoteItem`](types/GDriveRemoteItem.md) with file/folder ID, name, URL, MIME type, dates, and size.

## Enum Reference

### `ConflictBehavior`
| Value | Description |
|-------|-------------|
| `Replace` | Replace the existing item |
| `Fail` | Fail the request if another item with the same name exists |
| `Rename` | Rename the new item to have a unique name |
| `AddSeparate` | Add without renaming, even if same name exists |
| `UseExisting` | Return the existing item |

## XAML Example

```xml
<gsuite:CreateFolderConnections
    DisplayName="Create Folder"
    ConnectionId="[myConnection]"
    NewFolderName="[&quot;Reports 2025&quot;]"
    NewFolderDescription="[&quot;Quarterly reports folder&quot;]"
    ConflictResolution="[ConflictBehavior.AddSeparate]"
    Result="[newFolder]">
    <gsuite:CreateFolderConnections.Item>
        <models:DriveItemArgument InputMode="UrlOrId">
            <models:DriveItemArgument.IdOrUrl>
                <InArgument x:TypeArguments="x:String">[parentFolderId]</InArgument>
            </models:DriveItemArgument.IdOrUrl>
        </models:DriveItemArgument>
    </gsuite:CreateFolderConnections.Item>
</gsuite:CreateFolderConnections>
```

## Notes

- Requires a Google Workspace connection with Drive scope.
- `NewFolderName` is required; the activity will fail validation if not provided.
