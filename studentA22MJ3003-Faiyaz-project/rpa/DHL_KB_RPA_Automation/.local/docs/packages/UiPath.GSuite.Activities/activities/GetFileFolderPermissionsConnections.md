# Get File/Folder Permissions

`UiPath.GSuite.Activities.GetFileFolderPermissionsConnections`

Gets the list of permissions for a specified file or folder in Google Drive.

**Package:** `UiPath.GSuite.Activities`
**Category:** Drive
**Connector:** `uipath-google-drive`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | File or Folder | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | Yes | | The file or folder to get permissions for. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |
| `UseDomainAdminAccess` | Use Domain Admin Access | `InArgument` | `bool` | No | `false` | Act as an administrator of the domain. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google Workspace connection to use. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `Result` | Result | `OutArgument` | `List<`[`GDriveItemPermission`](types/GDriveItemPermission.md)`>` | The list of permissions for the file or folder. |

## Output Model

Returns a list of [`GDriveItemPermission`](types/GDriveItemPermission.md) items.

## XAML Example

```xml
<gsuite:GetFileFolderPermissionsConnections
    DisplayName="Get File/Folder Permissions"
    ConnectionId="[myConnection]"
    UseDomainAdminAccess="[False]"
    Result="[permissions]">
    <gsuite:GetFileFolderPermissionsConnections.Item>
        <models:DriveItemArgument InputMode="UrlOrId">
            <models:DriveItemArgument.IdOrUrl>
                <InArgument x:TypeArguments="x:String">[fileIdOrUrl]</InArgument>
            </models:DriveItemArgument.IdOrUrl>
        </models:DriveItemArgument>
    </gsuite:GetFileFolderPermissionsConnections.Item>
</gsuite:GetFileFolderPermissionsConnections>
```

## Notes

- Requires a Google Workspace connection with Drive scope.
