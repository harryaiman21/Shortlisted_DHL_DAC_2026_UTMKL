# Get File/Folder Info

`UiPath.GSuite.Activities.GetFileFolderInfoConnections`

Gets detailed metadata about a specified file or folder in Google Drive.

**Package:** `UiPath.GSuite.Activities`
**Category:** Drive
**Connector:** `uipath-google-drive`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | File or Folder | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | Yes | | The file or folder to get info for. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google Workspace connection to use. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `Result` | Result | `OutArgument` | `GDriveItemInfo` | Detailed metadata for the file or folder. |

## Output Model

Returns a `GDriveItemInfo` with file/folder ID, name, MIME type, size, dates, permissions, labels, and capabilities.

## XAML Example

```xml
<gsuite:GetFileFolderInfoConnections
    DisplayName="Get File/Folder Info"
    ConnectionId="[myConnection]"
    Result="[itemInfo]">
    <gsuite:GetFileFolderInfoConnections.Item>
        <models:DriveItemArgument InputMode="UrlOrId">
            <models:DriveItemArgument.IdOrUrl>
                <InArgument x:TypeArguments="x:String">[fileIdOrUrl]</InArgument>
            </models:DriveItemArgument.IdOrUrl>
        </models:DriveItemArgument>
    </gsuite:GetFileFolderInfoConnections.Item>
</gsuite:GetFileFolderInfoConnections>
```

## Notes

- Requires a Google Workspace connection with Drive scope.
