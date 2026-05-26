# Move File

`UiPath.GSuite.Activities.MoveFileConnections`

Moves a file to a different folder in Google Drive, optionally renaming it.

**Package:** `UiPath.GSuite.Activities`
**Category:** Drive
**Connector:** `uipath-google-drive`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | File | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | Yes | | The source file to move. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |
| `Destination` | Destination Folder | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | Yes | | The destination folder. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |
| `NewFileName` | New File Name | `InArgument` | `string` | No | | New name of the moved file. If empty, keeps the original name. |
| `ConflictResolution` | Conflict Resolution | `InArgument` | `ConflictBehavior` | No | `AddSeparate` | Behavior when a file with the same name already exists. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google Workspace connection to use. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `Result` | Result | `OutArgument` | [`GDriveRemoteItem`](types/GDriveRemoteItem.md) | Reference to the moved file in its new location. |

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
<gsuite:MoveFileConnections
    DisplayName="Move File"
    ConnectionId="[myConnection]"
    NewFileName="[newName]"
    ConflictResolution="[ConflictBehavior.AddSeparate]"
    Result="[movedFile]">
    <gsuite:MoveFileConnections.Item>
        <models:DriveItemArgument InputMode="UrlOrId">
            <models:DriveItemArgument.IdOrUrl>
                <InArgument x:TypeArguments="x:String">[fileIdOrUrl]</InArgument>
            </models:DriveItemArgument.IdOrUrl>
        </models:DriveItemArgument>
    </gsuite:MoveFileConnections.Item>
    <gsuite:MoveFileConnections.Destination>
        <models:DriveItemArgument InputMode="UrlOrId">
            <models:DriveItemArgument.IdOrUrl>
                <InArgument x:TypeArguments="x:String">[destinationFolderId]</InArgument>
            </models:DriveItemArgument.IdOrUrl>
        </models:DriveItemArgument>
    </gsuite:MoveFileConnections.Destination>
</gsuite:MoveFileConnections>
```

## Notes

- Requires a Google Workspace connection with Drive scope.
