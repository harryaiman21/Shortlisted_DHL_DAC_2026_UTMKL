# Upload Files

`UiPath.GSuite.Activities.UploadFilesConnections`

Uploads one or more local files to a Google Drive folder.

**Package:** `UiPath.GSuite.Activities`
**Category:** Drive
**Connector:** `uipath-google-drive`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Folder` | Destination Folder | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | No | | The Google Drive folder to upload files to. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |
| `FilesInputMode` | Files Input Mode | `Property` | `FilesInputMode` | No | `MultipleByVariable` | How to specify the files to upload. |
| `MultipleFilesToUpload` | Files | `InArgument` | `IEnumerable<IResource>` | Conditional | | Collection of files as a variable. Used when `FilesInputMode` is `MultipleByVariable`. |
| `FilesList` | Files | `Property` | `IEnumerable<InArgument<IResource>>` | Conditional | | The list of files to upload via the designer. Used when `FilesInputMode` is `MultipleByBuilder`. |
| `ConflictResolution` | Conflict Resolution | `InArgument` | `ConflictBehavior` | No | `AddSeparate` | Behavior when a file with the same name already exists. |
| `Convert` | Convert to Google Format | `InArgument` | `bool` | No | `false` | Convert to Google Workspace file types whenever possible. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google Workspace connection to use. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `FirstResult` | First Result | `OutArgument` | [`GDriveRemoteItem`](types/GDriveRemoteItem.md) | Reference to the first uploaded file. |
| `AllResults` | All Results | `OutArgument` | [`GDriveRemoteItem`](types/GDriveRemoteItem.md)`[]` | References to all uploaded files. |

## Output Model

Returns [`GDriveRemoteItem`](types/GDriveRemoteItem.md) instances with file/folder ID, name, URL, MIME type, dates, and size.

## Enum Reference

### `FilesInputMode`
| Value | Description |
|-------|-------------|
| `Single` | Single file (obsolete -- prefer `MultipleByVariable`) |
| `MultipleByVariable` | Variable containing a collection of files |
| `MultipleByBuilder` | Collection of files obtained through the collection builder |

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
<gsuite:UploadFilesConnections
    DisplayName="Upload Files"
    ConnectionId="[myConnection]"
    FilesInputMode="MultipleByVariable"
    MultipleFilesToUpload="[filesToUpload]"
    ConflictResolution="[ConflictBehavior.AddSeparate]"
    Convert="[False]"
    FirstResult="[firstUploadedFile]"
    AllResults="[allUploadedFiles]">
    <gsuite:UploadFilesConnections.Folder>
        <models:DriveItemArgument InputMode="UrlOrId">
            <models:DriveItemArgument.IdOrUrl>
                <InArgument x:TypeArguments="x:String">[destinationFolderId]</InArgument>
            </models:DriveItemArgument.IdOrUrl>
        </models:DriveItemArgument>
    </gsuite:UploadFilesConnections.Folder>
</gsuite:UploadFilesConnections>
```

## Notes

- Requires a Google Workspace connection with Drive scope.
- Folders in the input collection are skipped; only files are uploaded.
