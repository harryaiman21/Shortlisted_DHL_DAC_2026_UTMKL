# Delete File/Folder Permission

`UiPath.GSuite.Activities.DeleteFileFolderPermissionConnections`

Removes a specific sharing permission from a file or folder in Google Drive.

**Package:** `UiPath.GSuite.Activities`
**Category:** Drive
**Connector:** `uipath-google-drive`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | File or Folder | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | Yes | | The file or folder to remove the permission from. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |
| `PermissionId` | Permission ID | `InArgument` | `string` | Yes | | The ID of the permission to delete. |
| `UseDomainAdminAccess` | Use Domain Admin Access | `InArgument` | `bool` | No | `false` | Act as an administrator of the domain. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google Workspace connection to use. |

## XAML Example

```xml
<gsuite:DeleteFileFolderPermissionConnections
    DisplayName="Delete File/Folder Permission"
    ConnectionId="[myConnection]"
    PermissionId="[permissionId]"
    UseDomainAdminAccess="[False]">
    <gsuite:DeleteFileFolderPermissionConnections.Item>
        <models:DriveItemArgument InputMode="UrlOrId">
            <models:DriveItemArgument.IdOrUrl>
                <InArgument x:TypeArguments="x:String">[fileIdOrUrl]</InArgument>
            </models:DriveItemArgument.IdOrUrl>
        </models:DriveItemArgument>
    </gsuite:DeleteFileFolderPermissionConnections.Item>
</gsuite:DeleteFileFolderPermissionConnections>
```

## Notes

- The `PermissionId` can be obtained from a [`GDriveItemPermission`](types/GDriveItemPermission.md)`.Id` property returned by Get File/Folder Permissions.
- Requires a Google Workspace connection with Drive scope.
- `PermissionId` is required; the activity will fail validation if not provided.
