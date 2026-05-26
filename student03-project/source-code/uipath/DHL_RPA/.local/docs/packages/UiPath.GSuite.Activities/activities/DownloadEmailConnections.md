# Download Email

`DownloadEmailConnections`

Downloads an email as an .eml file from Gmail to the local filesystem.

**Package:** `UiPath.GSuite.Activities`
**Category:** Gmail
**Connector:** `uipath-google-gmail`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Email` | Email | `InArgument` | [`GmailMessage`](types/GmailMessage.md) | Yes | | The email to download. |
| `DestinationPath` | Destination Path | `InArgument` | `string` | No | | The local path where the downloaded email file is saved. |
| `ConflictResolution` | Conflict Resolution | `InArgument` | [`ConflictBehavior`](#enum-reference) | No | `Fail` | Conflict resolution behavior when a file with the same name already exists. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google connection to use. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `NewResult` | Result | `OutArgument` | [`GmailMessageLocalItem`](types/GmailMessageLocalItem.md) | The downloaded email file. |

## Enum Reference

| Enum | Values |
|------|--------|
| [`ConflictBehavior`] | `Replace`, `Fail`, `Rename` |

## Notes

- The `Email` property is required.
- If `DestinationPath` is not specified, the file is available as an in-memory resource.
