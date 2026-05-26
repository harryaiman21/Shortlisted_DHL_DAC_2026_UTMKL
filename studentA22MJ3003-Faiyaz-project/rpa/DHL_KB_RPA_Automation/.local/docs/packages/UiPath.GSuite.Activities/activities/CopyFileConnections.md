# Copy File

`UiPath.GSuite.Activities.CopyFileConnections`

Copies a file in Google Drive to a specified destination folder, optionally with a new name.

**Package:** `UiPath.GSuite.Activities`
**Category:** Drive
**Connector:** `uipath-google-drive`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | File | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | Yes | | The source file to copy. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |
| `Destination` | Destination Folder | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | No | | The destination folder. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. If not specified, copies to the same parent folder. |
| `NewFileName` | New File Name | `InArgument` | `string` | No | | Name of the copied file. If empty, the original name is used. |
| `ConflictResolution` | Conflict Resolution | `InArgument` | `ConflictBehavior` | No | `AddSeparate` | Behavior when a file with the same name already exists. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google Workspace connection to use. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `Result` | Result | `OutArgument` | [`GDriveRemoteItem`](types/GDriveRemoteItem.md) | Reference to the copied file. |

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
<gsuite:CopyFileConnections
    DisplayName="Copy File"
    ConnectionId="[myConnection]"
    NewFileName="[newName]"
    ConflictResolution="[ConflictBehavior.AddSeparate]"
    Result="[copiedFile]">
    <gsuite:CopyFileConnections.Item>
        <models:DriveItemArgument InputMode="UrlOrId">
            <models:DriveItemArgument.IdOrUrl>
                <InArgument x:TypeArguments="x:String">[fileIdOrUrl]</InArgument>
            </models:DriveItemArgument.IdOrUrl>
        </models:DriveItemArgument>
    </gsuite:CopyFileConnections.Item>
    <gsuite:CopyFileConnections.Destination>
        <models:DriveItemArgument InputMode="UrlOrId">
            <models:DriveItemArgument.IdOrUrl>
                <InArgument x:TypeArguments="x:String">[destinationFolderId]</InArgument>
            </models:DriveItemArgument.IdOrUrl>
        </models:DriveItemArgument>
    </gsuite:CopyFileConnections.Destination>
</gsuite:CopyFileConnections>
```

## Notes

- Requires a Google Workspace connection with Drive scope.
- If no destination folder is specified, the file is copied to the same parent folder as the original.
