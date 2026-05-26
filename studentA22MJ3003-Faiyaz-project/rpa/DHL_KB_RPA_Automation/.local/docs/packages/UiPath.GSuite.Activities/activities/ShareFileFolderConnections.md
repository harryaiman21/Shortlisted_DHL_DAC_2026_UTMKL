# Share File/Folder

`UiPath.GSuite.Activities.ShareFileFolderConnections`

Shares a file or folder with specified recipients by creating a permission in Google Drive.

**Package:** `UiPath.GSuite.Activities`
**Category:** Drive
**Connector:** `uipath-google-drive`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | File or Folder | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | Yes | | The file or folder to share. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |
| `ShareWith` | Share With | `Property` | `GranteeType` | No | `USER` | The type of grantee to share with. |
| `Role` | Role | `InArgument` | `Roles` | No | `READER` | The permission role to grant. |
| `UserEmail` | User Email | `InArgument` | `string` | Conditional | | Email address. Required when `ShareWith` is `USER` or `GROUP`. |
| `Domain` | Domain | `InArgument` | `string` | Conditional | | Domain name. Required when `ShareWith` is `DOMAIN`. |
| `SendNotificationEmail` | Send Notification Email | `InArgument` | `bool` | No | `true` | Whether to send a notification email to the grantee. |
| `UseDomainAdminAccess` | Use Domain Admin Access | `InArgument` | `bool` | No | `false` | Whether to issue the request as a domain administrator. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google Workspace connection to use. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `AccessUrl` | Access URL | `OutArgument` | `string` | The web URL of the shared drive item. |

## Enum Reference

### `GranteeType`
| Value | Description |
|-------|-------------|
| `USER` | Share with a specific user by email |
| `GROUP` | Share with a Google Group by email |
| `DOMAIN` | Share with all users in a domain |
| `ANYONE` | Share with anyone (public) |

### `Roles`
| Value | Description |
|-------|-------------|
| `OWNER` | Full ownership |
| `WRITER` | Edit access |
| `COMMENTER` | Comment-only access |
| `READER` | View-only access |

## XAML Example

```xml
<gsuite:ShareFileFolderConnections
    DisplayName="Share File/Folder"
    ConnectionId="[myConnection]"
    ShareWith="USER"
    Role="[Roles.READER]"
    UserEmail="[&quot;colleague@example.com&quot;]"
    SendNotificationEmail="[True]"
    UseDomainAdminAccess="[False]"
    AccessUrl="[shareUrl]">
    <gsuite:ShareFileFolderConnections.Item>
        <models:DriveItemArgument InputMode="UrlOrId">
            <models:DriveItemArgument.IdOrUrl>
                <InArgument x:TypeArguments="x:String">[fileIdOrUrl]</InArgument>
            </models:DriveItemArgument.IdOrUrl>
        </models:DriveItemArgument>
    </gsuite:ShareFileFolderConnections.Item>
</gsuite:ShareFileFolderConnections>
```

## Notes

- Requires a Google Workspace connection with Drive scope.
- When `ShareWith` is `USER` or `GROUP`, `UserEmail` is required.
- When `ShareWith` is `DOMAIN`, `Domain` is required.
