# Delete File or Folder

`UiPath.GSuite.Activities.DeleteFileOrFolderConnections`

Deletes a file or folder from Google Drive, either moving it to Trash or permanently deleting it.

**Package:** `UiPath.GSuite.Activities`
**Category:** Drive
**Connector:** `uipath-google-drive`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | File or Folder | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | Yes | | The file or folder to delete. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |
| `PermanentlyDelete` | Permanently Delete | `InArgument` | `bool` | No | `false` | Whether to permanently delete the item or move it to Trash. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google Workspace connection to use. |

## XAML Example

```xml
<gsuite:DeleteFileOrFolderConnections
    DisplayName="Delete File or Folder"
    ConnectionId="[myConnection]"
    PermanentlyDelete="[False]">
    <gsuite:DeleteFileOrFolderConnections.Item>
        <models:DriveItemArgument InputMode="UrlOrId">
            <models:DriveItemArgument.IdOrUrl>
                <InArgument x:TypeArguments="x:String">[fileIdOrUrl]</InArgument>
            </models:DriveItemArgument.IdOrUrl>
        </models:DriveItemArgument>
    </gsuite:DeleteFileOrFolderConnections.Item>
</gsuite:DeleteFileOrFolderConnections>
```

## Notes

- By default, items are moved to Trash and can be restored within 30 days.
- Deleting a folder also deletes all its contents.
- Requires a Google Workspace connection with Drive scope.
