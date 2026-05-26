# Rename File/Folder

`UiPath.GSuite.Activities.RenameFileFolderConnections`

Renames a file or folder in Google Drive.

**Package:** `UiPath.GSuite.Activities`
**Category:** Drive
**Connector:** `uipath-google-drive`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | File or Folder | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | Yes | | The file or folder to rename. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |
| `NewName` | New Name | `InArgument` | `string` | Yes | | New name for the file or folder. |
| `ConflictResolution` | Conflict Resolution | `InArgument` | `RenameConflictBehavior` | No | `AddSeparate` | Behavior when a file/folder with the same name already exists. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google Workspace connection to use. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `Result` | Result | `OutArgument` | [`GDriveRemoteItem`](types/GDriveRemoteItem.md) | Reference to the renamed file or folder. |

## Output Model

Returns a [`GDriveRemoteItem`](types/GDriveRemoteItem.md) with file/folder ID, name, URL, MIME type, dates, and size.

## Enum Reference

### `RenameConflictBehavior`
| Value | Description |
|-------|-------------|
| `Fail` | Fail the request if another item with the same name exists |
| `AddSeparate` | Add without renaming, even if same name exists |

## XAML Example

```xml
<gsuite:RenameFileFolderConnections
    DisplayName="Rename File/Folder"
    ConnectionId="[myConnection]"
    NewName="[&quot;Q4 Report Final.xlsx&quot;]"
    ConflictResolution="[RenameConflictBehavior.AddSeparate]"
    Result="[renamedItem]">
    <gsuite:RenameFileFolderConnections.Item>
        <models:DriveItemArgument InputMode="UrlOrId">
            <models:DriveItemArgument.IdOrUrl>
                <InArgument x:TypeArguments="x:String">[fileIdOrUrl]</InArgument>
            </models:DriveItemArgument.IdOrUrl>
        </models:DriveItemArgument>
    </gsuite:RenameFileFolderConnections.Item>
</gsuite:RenameFileFolderConnections>
```

## Notes

- Requires a Google Workspace connection with Drive scope.
- `NewName` is required; the activity will fail validation if not provided.
