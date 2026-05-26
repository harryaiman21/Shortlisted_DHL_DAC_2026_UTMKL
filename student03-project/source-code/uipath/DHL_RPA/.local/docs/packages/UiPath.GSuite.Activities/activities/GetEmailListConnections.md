# Get Email List

`GetEmailListConnections`

Retrieves a list of emails from a specified Gmail folder (label), with optional filtering.

**Package:** `UiPath.GSuite.Activities`
**Category:** Gmail
**Connector:** `uipath-google-gmail`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Folder` | Folder | `Property` | [`FolderArgument`](components/FolderArgument.md) | No | | The Gmail label/folder. See [FolderArgument](components/FolderArgument.md) for input modes. |
| `MaxResults` | Max Results | `InArgument` | `int` | No | `100` | The maximum number of emails to retrieve. If 0 or negative, all matching emails are returned. |
| `IncludeSubfolders` | Include Subfolders | `InArgument` | `bool` | No | `false` | Specifies whether to expand the search to include all subfolders of the selected mail folder. |
| `UnreadOnly` | Unread Only | `InArgument` | `bool` | No | `false` | Indicates whether to consider only unread emails. |
| `WithAttachmentsOnly` | With Attachments Only | `InArgument` | `bool` | No | `false` | Indicates whether to consider only emails with attachments. |
| `ImportantOnly` | Important Only | `InArgument` | `bool` | No | `false` | Return only important emails. |
| `StarredOnly` | Starred Only | `InArgument` | `bool` | No | `false` | Return only starred emails. |
| `MarkAsRead` | Mark As Read | `InArgument` | `bool` | No | `false` | Indicates whether to mark the retrieved emails as read. |

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
| `EmailList` | Email List | `OutArgument` | `List<`[`GmailMessage`](types/GmailMessage.md)`>` | The retrieved email list. |

## Output Model

Returns a `List<`[`GmailMessage`](types/GmailMessage.md)`>` with email details including subject, body, sender, recipients, and metadata.

## Enum Reference

| Enum | Values |
|------|--------|
| [`FilterMode`] | `ConditionBuilder`, `Query` |

## Notes

- If `MaxResults` is 0 or negative, all matching emails are returned.
- Does not include attachments in the returned messages by default.
