# Mark As Read/Unread

`MarkAsReadUnreadConnections`

Marks an email as read or unread in Gmail.

**Package:** `UiPath.GSuite.Activities`
**Category:** Gmail
**Connector:** `uipath-google-gmail`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Email` | Email | `InArgument` | [`GmailMessage`](types/GmailMessage.md) | Yes | | The email to mark as read or unread. |
| `MarkAs` | Mark As | `InArgument` | [`MarkAsReadUnread`](#enum-reference) | No | `Read` | The new read/unread state of the selected email. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google connection to use. |

## Enum Reference

| Enum | Values |
|------|--------|
| [`MarkAsReadUnread`] | `Read`, `Unread` |

## Notes

- The `Email` property is required.
