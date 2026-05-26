# Move Email

`MoveEmailConnections`

Moves an email to a specified Gmail folder (label).

**Package:** `UiPath.GSuite.Activities`
**Category:** Gmail
**Connector:** `uipath-google-gmail`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Email` | Email | `InArgument` | [`GmailMessage`](types/GmailMessage.md) | Yes | | The email to move. |
| `Folder` | Folder | `Property` | [`FolderArgument`](components/FolderArgument.md) | No | | The destination Gmail label/folder. See [FolderArgument](components/FolderArgument.md) for input modes. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google connection to use. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `Result` | Result | `OutArgument` | [`GmailMessage`](types/GmailMessage.md) | The moved email. |

## Output Model

Returns a [`GmailMessage`](types/GmailMessage.md) representing the email after it has been moved.

## Notes

- The `Email` property is required.
