# Update File/Folder Permission

`UiPath.GSuite.Activities.UpdateFileFolderPermissionConnections`

Updates a file permission for the specified file or folder in Google Drive.

**Package:** `UiPath.GSuite.Activities`
**Category:** Drive
**Connector:** `uipath-google-drive`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | File or Folder | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | Yes | | The file or folder whose permission to update. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |
| `PermissionId` | Permission ID | `InArgument` | `string` | Yes | | The ID of the permission to update. |
| `Role` | Role | `InArgument` | `Roles` | Yes | `READER` | The permission role to set. |
| `ExpirationTime` | Expiration Time | `InArgument` | `DateTime?` | No | | When the permission expires. Cannot be set for `OWNER`/`WRITER` roles or with `RemoveExpiration`. |
| `RemoveExpiration` | Remove Expiration | `InArgument` | `bool` | No | `false` | Whether to remove the expiration date. Cannot be used with `ExpirationTime`. |
| `UseDomainAdminAccess` | Use Domain Admin Access | `InArgument` | `bool` | No | `false` | Whether to act as a domain administrator. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google Workspace connection to use. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `Result` | Result | `OutArgument` | [`GDriveItemPermission`](types/GDriveItemPermission.md) | The updated permission details. |

## Enum Reference

### `Roles`
| Value | Description |
|-------|-------------|
| `OWNER` | Full ownership |
| `WRITER` | Edit access |
| `COMMENTER` | Comment-only access |
| `READER` | View-only access |

## XAML Example

```xml
<gsuite:UpdateFileFolderPermissionConnections
    DisplayName="Update File/Folder Permission"
    ConnectionId="[myConnection]"
    PermissionId="[permissionId]"
    Role="[Roles.WRITER]"
    UseDomainAdminAccess="[False]"
    Result="[updatedPermission]">
    <gsuite:UpdateFileFolderPermissionConnections.Item>
        <models:DriveItemArgument InputMode="UrlOrId">
            <models:DriveItemArgument.IdOrUrl>
                <InArgument x:TypeArguments="x:String">[fileIdOrUrl]</InArgument>
            </models:DriveItemArgument.IdOrUrl>
        </models:DriveItemArgument>
    </gsuite:UpdateFileFolderPermissionConnections.Item>
</gsuite:UpdateFileFolderPermissionConnections>
```

## Notes

- Requires a Google Workspace connection with Drive scope.
- `PermissionId` and `Role` are required; the activity will fail validation if not provided.
- `ExpirationTime` cannot be set when `Role` is `OWNER` or `WRITER`.
- `ExpirationTime` and `RemoveExpiration` cannot both be set simultaneously.
