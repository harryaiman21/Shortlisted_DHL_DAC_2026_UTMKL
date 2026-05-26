# Archive Email

`ArchiveEmailConnections`

Archives an email in Gmail by removing the Inbox label.

**Package:** `UiPath.GSuite.Activities`
**Category:** Gmail
**Connector:** `uipath-google-gmail`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Email` | Email | `InArgument` | [`GmailMessage`](types/GmailMessage.md) | Yes | | The email to archive. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google connection to use. |

## Notes

- The `Email` property is required.
