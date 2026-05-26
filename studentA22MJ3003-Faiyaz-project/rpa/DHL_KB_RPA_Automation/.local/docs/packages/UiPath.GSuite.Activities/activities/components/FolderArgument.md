# FolderArgument

`UiPath.GSuite.Activities.Gmail.Models.FolderArgument`

A composition component used by Gmail activities to specify a target Gmail folder (label). Supports browsing for a folder or manually entering a label name/path.

**Assembly:** `UiPath.GSuite.Activities`
**Inherits:** `BaseFolderArgument`

## InputMode (`FolderInputMode`)

Determines which properties are active.

| Mode | Value | Description | AI-XAML Suitable |
|------|-------|-------------|------------------|
| `Browse` | `0` | Select a folder from the remote browser in Studio. | **Not suitable for AI-generated XAML** -- requires interactive Studio UI. |
| `EnterPath` | `1` | Manually type a label name or path. | Yes |

## Properties

| Property | Type | Mode(s) | Description |
|----------|------|---------|-------------|
| `InputMode` | `FolderInputMode` | All | How the folder is specified: Browse to select from a list, or EnterPath to type a label name. |
| `BrowserFolderName` | `InArgument<string>` | Browse | The display name of the folder selected via the browser. |
| `BrowserFolderId` | `string` | Browse | The Gmail label ID persisted after the user selects a folder via the browser. |
| `ManualEntryFolderName` | `InArgument<string>` | EnterPath | The folder name/path entered manually by the user. |
| `ConnectionKey` | `string` | All | The connection identifier that was active when the folder was selected, used to detect connection changes. |
| `ConnectionDescriptor` | `string` | All | A human-readable label for the connection (e.g., account email) shown in the designer. |
| `Backup` | `BackupSlot<FolderInputMode>` | All | Stores the previous InputMode value so the designer can revert when switching modes. |

## XAML Examples

### EnterPath Mode

```xml
<FolderArgument InputMode="EnterPath">
  <FolderArgument.ManualEntryFolderName>
    <InArgument x:TypeArguments="x:String">INBOX</InArgument>
  </FolderArgument.ManualEntryFolderName>
</FolderArgument>
```

## Notes

- The special label name "All Mail" is recognized and maps to the Gmail "All Mail" system label without requiring a lookup.
- When the connection changes in Browse mode, the folder is re-resolved by looking up the label by name.
- `BrowserFolderId` has the `[AutopilotIgnored]` attribute -- it is a regular property but is typically populated by the Studio browser, not by users directly.

## Used By

Gmail activities that need a folder/label reference -- see activity docs for details.
