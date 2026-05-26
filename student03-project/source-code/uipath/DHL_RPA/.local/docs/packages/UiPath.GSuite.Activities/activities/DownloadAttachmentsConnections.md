# Download Attachments

`DownloadAttachmentsConnections`

Downloads email attachments from a Gmail message to the local filesystem.

**Package:** `UiPath.GSuite.Activities`
**Category:** Gmail
**Connector:** `uipath-google-gmail`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Email` | Email | `InArgument` | [`GmailMessage`](types/GmailMessage.md) | Yes | | The email to get the attachments from. |
| `ExcludeInlineAttachments` | Exclude Inline Attachments | `InArgument` | `bool` | No | `false` | Indicates whether to exclude inline attachments (embedded in the email body). |
| `FilterByFileNames` | Filter By File Names | `InArgument` | `string` | No | | Download only attachments whose name matches the specified pattern. Multiple patterns separated by `\|`. |
| `DestinationPath` | Destination Path | `InArgument` | `string` | No | | The local path where the downloaded attachments are saved. |
| `ConflictResolution` | Conflict Resolution | `InArgument` | [`ConflictBehavior`](#enum-reference) | No | `Fail` | Conflict resolution behavior for files with the same name. |
| `SearchMode` | Search Mode | `Property` | [`SearchSelectionMode`](#enum-reference) | No | `UseSimple` | Toggle between simple filename filter and advanced filter conditions. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google connection to use. |
| `Filter` | Filter | [`FilenameFilterCollection`](filtering/FilenameFilterCollection.md) | | Advanced filename filter conditions. Used when `SearchMode` is `UseAdvanced`. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `NewResult` | Result | `OutArgument` | [`GmailAttachmentLocalItem`](types/GmailAttachmentLocalItem.md)`[]` | The downloaded attachment files. |

## Enum Reference

| Enum | Values |
|------|--------|
| [`ConflictBehavior`] | `Replace`, `Fail`, `Rename` |
| [`SearchSelectionMode`] | `UseSimple`, `UseAdvanced` |

## Notes

- The `Email` property is required.
- Throws an error if the destination path does not exist.
