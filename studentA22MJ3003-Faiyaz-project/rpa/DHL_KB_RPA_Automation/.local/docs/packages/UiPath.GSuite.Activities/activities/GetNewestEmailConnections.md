# Get Newest Email

`GetNewestEmailConnections`

Retrieves the newest email from a specified Gmail folder/label, with optional filtering.

**Package:** `UiPath.GSuite.Activities`
**Category:** Gmail
**Connector:** `uipath-google-gmail`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Folder` | Folder | `Property` | [`FolderArgument`](components/FolderArgument.md) | No | | The Gmail label/folder. See [FolderArgument](components/FolderArgument.md) for input modes. |
| `UnreadOnly` | Unread Only | `InArgument` | `bool` | No | `false` | Retrieve only unread emails. |
| `WithAttachmentsOnly` | With Attachments Only | `InArgument` | `bool` | No | `false` | Retrieve only emails with attachments. |
| `ImportantOnly` | Important Only | `InArgument` | `bool` | No | `false` | Retrieve only important emails. |
| `StarredOnly` | Starred Only | `InArgument` | `bool` | No | `false` | Retrieve only starred emails. |
| `MarkAsRead` | Mark As Read | `InArgument` | `bool` | No | `false` | Mark the retrieved email as read. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google connection to use. |
| `FilterSelectionMode` | Filter Selection Mode | [`FilterMode`](#enum-reference) | `ConditionBuilder` | How filters are specified: via condition builder or a raw query string. |
| `QueryFilter` | Query Filter | `InArgument<string>` | | A raw Gmail search query string. Used when `FilterSelectionMode` is `Query`. |
| `Filter` | Filter | [`MailFilterCollection`](filtering/MailFilterCollection.md) | | Condition-based filter. See [MailFilterCollection](filtering/MailFilterCollection.md) for criteria and operators. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `Result` | Result | `OutArgument` | [`GmailMessage`](types/GmailMessage.md) | The newest email matching the criteria. |

## Output Model

Returns a [`GmailMessage`](types/GmailMessage.md) with the newest email details.

## Enum Reference

| Enum | Values |
|------|--------|
| [`FilterMode`] | `ConditionBuilder`, `Query` |

## Notes

- Throws an exception if no email matching the criteria is found.
