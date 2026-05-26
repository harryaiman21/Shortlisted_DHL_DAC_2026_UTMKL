# Delete Email

`DeleteEmailConnections`

Deletes an email from Gmail (moves to Trash or permanently deletes).

**Package:** `UiPath.GSuite.Activities`
**Category:** Gmail
**Connector:** `uipath-google-gmail`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Email` | Email | `InArgument` | [`GmailMessage`](types/GmailMessage.md) | Yes | | The email to delete. |
| `PermanentlyDelete` | Permanently Delete | `InArgument` | `bool` | No | `false` | Indicates whether to delete the email permanently (bypassing Trash). |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google connection to use. |

## Notes

- The `Email` property is required.
- When `PermanentlyDelete` is `false` (default), the email is moved to Trash.
