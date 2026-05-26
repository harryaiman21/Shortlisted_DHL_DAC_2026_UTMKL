# Create Document

`UiPath.GSuite.Activities.CreateDocumentConnections`

Creates a new Google Docs document in Google Drive under a specified parent folder.

**Package:** `UiPath.GSuite.Activities`
**Category:** Drive
**Connector:** `uipath-google-drive`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | Parent Folder | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | No | | The parent folder where the document is created. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |
| `DocumentName` | Document Name | `InArgument` | `string` | Yes | | The name of the new document. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google Workspace connection to use. |
| `ConflictResolution` | Conflict Resolution | `InArgument<ConflictBehavior>` | `Fail` | Behavior when a document with the same name already exists. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `NewDocument` | New Document | `OutArgument` | [`GDriveRemoteItem`](types/GDriveRemoteItem.md) | The newly created document. |

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
<gsuite:CreateDocumentConnections
    DisplayName="Create Document"
    ConnectionId="[myConnection]"
    DocumentName="[&quot;MyReport&quot;]"
    ConflictResolution="[ConflictBehavior.Fail]"
    NewDocument="[newDoc]">
    <gsuite:CreateDocumentConnections.Item>
        <models:DriveItemArgument InputMode="UrlOrId">
            <models:DriveItemArgument.IdOrUrl>
                <InArgument x:TypeArguments="x:String">[parentFolderId]</InArgument>
            </models:DriveItemArgument.IdOrUrl>
        </models:DriveItemArgument>
    </gsuite:CreateDocumentConnections.Item>
</gsuite:CreateDocumentConnections>
```

## Notes

- Requires a Google Workspace connection with Drive and Docs scopes.
- `DocumentName` is required; the activity will fail validation if not provided.
- If no parent folder is specified, the document is created in the authenticated user's root Drive folder.
