# DriveItemArgument

`UiPath.GSuite.Activities.Models.DriveItemArgument`

A composition component used by Google Drive activities to specify a target file or folder. Supports multiple input modes so users can identify items by browsing, URL/ID, existing variable, full path, or relative path.

**Assembly:** `UiPath.GSuite.Activities`
**Inherits:** `BaseDriveItemArgument`

## InputMode (`EDriveItemMode`)

Determines which properties are active.

| Mode | Value | Description | AI-XAML Suitable |
|------|-------|-------------|------------------|
| `Browse` | `0` | Select a file/folder from the remote browser in Studio. | **Not suitable for AI-generated XAML** -- requires interactive Studio UI. |
| `UrlOrId` | `1` | Manually enter a file/folder ID or URL. | Yes |
| `UseExisting` | `2` | Use an existing [`GDriveRemoteItem`](../types/GDriveRemoteItem.md) variable. | Yes |
| `FullPath` | `3` | Enter the absolute path from the drive root. | Yes |
| `RelativePath` | `4` | Specify a parent folder and a relative path from it. | Yes |

## Properties

| Property | Type | Mode(s) | Description |
|----------|------|---------|-------------|
| `InputMode` | `EDriveItemMode` | All | Determines how the file/folder is specified. |
| `Existing` | `InArgument<`[`GDriveRemoteItem`](../types/GDriveRemoteItem.md)`>` | UseExisting | An existing file/folder variable. |
| `IdOrUrl` | `InArgument<string>` | UrlOrId | File ID or file URL manually entered. |
| `BrowserId` | `InArgument<string>` | Browse | File ID saved when browsing. |
| `DriveId` | `InArgument<string>` | Browse | The drive ID of the file. Present if the file is in a shared drive. |
| `FriendlyName` | `InArgument<string>` | Browse | File friendly name from browsing. |
| `FullPath` | `InArgument<string>` | FullPath | The absolute path of the file starting from the root of the drive. |
| `FullPathHint` | `InArgument<string>` | Browse | The absolute path hint as specified by the browser (used for fallback resolution). |
| `ParentId` | `InArgument<string>` | RelativePath | The ID of the parent folder. |
| `ParentIdFriendlyName` | `InArgument<string>` | RelativePath | Friendly name of the parent folder. |
| `ParentIdFullPathHint` | `InArgument<string>` | RelativePath | The absolute path hint for the parent folder (used for fallback resolution). |
| `RelativePath` | `InArgument<string>` | RelativePath | Relative path with respect to the parent folder. |
| `ConnectionKey` | `string` | All | The ID of the connection from the moment the connection data was chosen. |
| `ConnectionDescriptor` | `string` | All | A user-friendly string describing the connection. |
| `Backup` | `BackupSlot<EDriveItemMode>` | All | Stores the previous InputMode value for designer revert. |

## XAML Examples

### UrlOrId Mode

```xml
<DriveItemArgument InputMode="UrlOrId">
  <DriveItemArgument.IdOrUrl>
    <InArgument x:TypeArguments="x:String">https://docs.google.com/document/d/abc123/edit</InArgument>
  </DriveItemArgument.IdOrUrl>
</DriveItemArgument>
```

### UseExisting Mode

```xml
<DriveItemArgument InputMode="UseExisting">
  <DriveItemArgument.Existing>
    <InArgument x:TypeArguments="drive:GDriveRemoteItem">[MyFileVariable]</InArgument>
  </DriveItemArgument.Existing>
</DriveItemArgument>
```

### FullPath Mode

```xml
<DriveItemArgument InputMode="FullPath">
  <DriveItemArgument.FullPath>
    <InArgument x:TypeArguments="x:String">My Drive/Documents/report.pdf</InArgument>
  </DriveItemArgument.FullPath>
</DriveItemArgument>
```

### RelativePath Mode

```xml
<DriveItemArgument InputMode="RelativePath">
  <DriveItemArgument.ParentId>
    <InArgument x:TypeArguments="x:String">folder-id-123</InArgument>
  </DriveItemArgument.ParentId>
  <DriveItemArgument.RelativePath>
    <InArgument x:TypeArguments="x:String">subfolder/report.pdf</InArgument>
  </DriveItemArgument.RelativePath>
</DriveItemArgument>
```

## Notes

- When the connection changes between design time and runtime, Browse and RelativePath modes attempt to re-resolve items by path hint as a fallback.
- The `Undefined` enum value (value -999) is obsolete and exists only for Studio Web compatibility.
- `BrowserId`, `DriveId`, and `ParentId` have the `[AutopilotIgnored]` attribute -- they are regular properties but are typically populated by the Studio browser, not by users directly.

## Used By

Google Drive activities that need a file or folder reference -- see activity docs for details.
