# Get File List

`UiPath.GSuite.Activities.GetFileListConnections`

Retrieves a list of files and folders from a Google Drive location, with optional filtering.

**Package:** `UiPath.GSuite.Activities`
**Category:** Drive
**Connector:** `uipath-google-drive`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | Folder | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | No | | The Google Drive folder to list files from. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |
| `MaxResults` | Max Results | `InArgument` | `int` | No | `200` | The maximum number of files and folders to return. |
| `WhatToReturn` | What to Return | `InArgument` | `LocationType` | No | `Files` | Whether to return only files, only folders, or both. |
| `StarredOnly` | Starred Only | `InArgument` | `bool` | No | `false` | Whether to return only starred files and folders. |
| `FilterSelectionMode` | Filter Selection Mode | `Property` | `FilterMode` | No | `ConditionBuilder` | Whether to use the condition builder or a raw query string. |
| `QueryFilter` | Query Filter | `InArgument` | `string` | No | | Raw Google Drive query string. Used when `FilterSelectionMode` is `Query`. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google Workspace connection to use. |
| `Filter` | Filter | [`FileFilterArgument`](filtering/FileFilterArgument.md) | | See [FileFilterArgument](filtering/FileFilterArgument.md) for criteria and operators. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `Result` | Result | `OutArgument` | [`GDriveRemoteItem`](types/GDriveRemoteItem.md)`[]` | The resulting collection of files and folders. |

## Output Model

Returns an array of [`GDriveRemoteItem`](types/GDriveRemoteItem.md) with file/folder ID, name, URL, MIME type, dates, and size.

## Enum Reference

### `LocationType`
| Value | Description |
|-------|-------------|
| `FilesAndFolders` | Return both files and folders |
| `Files` | Return only files |
| `Folders` | Return only folders |

### `FilterMode`
| Value | Description |
|-------|-------------|
| `ConditionBuilder` | Filter using the condition builder |
| `Query` | Filter using a raw Google Drive query string |

## XAML Example

```xml
<gsuite:GetFileListConnections
    DisplayName="Get File List"
    ConnectionId="[myConnection]"
    WhatToReturn="[LocationType.Files]"
    MaxResults="[100]"
    StarredOnly="[False]"
    FilterSelectionMode="Query"
    QueryFilter="[&quot;name contains 'report'&quot;]"
    Result="[fileList]">
    <gsuite:GetFileListConnections.Item>
        <models:DriveItemArgument InputMode="UrlOrId">
            <models:DriveItemArgument.IdOrUrl>
                <InArgument x:TypeArguments="x:String">[folderId]</InArgument>
            </models:DriveItemArgument.IdOrUrl>
        </models:DriveItemArgument>
    </gsuite:GetFileListConnections.Item>
</gsuite:GetFileListConnections>
```

## Notes

- Requires a Google Workspace connection with Drive and Drive Labels scopes.
- Results are sorted by name.
