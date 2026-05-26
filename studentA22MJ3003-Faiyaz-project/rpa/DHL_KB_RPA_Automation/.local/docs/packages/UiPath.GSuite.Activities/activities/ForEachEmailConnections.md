# For Each Email

`ForEachEmailConnections`

Iterates over a collection of emails from a specified Gmail folder/label, executing contained activities for each email.

**Package:** `UiPath.GSuite.Activities`
**Category:** Gmail
**Connector:** `uipath-google-gmail`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Folder` | Folder | `Property` | [`FolderArgument`](components/FolderArgument.md) | No | | The Gmail label/folder. See [FolderArgument](components/FolderArgument.md) for input modes. |
| `CurrentItemVariableName` | Current Item Variable Name | `Property` | `string` | Yes | `CurrentEmail` | Identifier for the current [`GmailMessage`](types/GmailMessage.md) in the iteration. |
| `MaxResults` | Max Results | `InArgument` | `int` | No | `100` | The number of emails to iterate through. |
| `IncludeSubfolders` | Include Subfolders | `InArgument` | `bool` | No | `false` | Specifies whether to expand the search to include all subfolders. |
| `UnreadOnly` | Unread Only | `InArgument` | `bool` | No | `false` | Indicates whether to consider only unread emails. |
| `WithAttachmentsOnly` | With Attachments Only | `InArgument` | `bool` | No | `false` | Indicates whether to consider only emails with attachments. |
| `ImportantOnly` | Important Only | `InArgument` | `bool` | No | `false` | Return only important emails. |
| `StarredOnly` | Starred Only | `InArgument` | `bool` | No | `false` | Return only starred emails. |
| `MarkAsRead` | Mark As Read | `InArgument` | `bool` | No | `false` | Indicates whether to mark the retrieved email as read. |

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
| `Length` | Length | `OutArgument` | `int` | The number of emails processed. |

## Enum Reference

| Enum | Values |
|------|--------|
| [`FilterMode`] | `ConditionBuilder`, `Query` |

## Notes

- This is a container activity; the `Body` contains the activities to execute for each [`GmailMessage`](types/GmailMessage.md).
- The current email is available via the `CurrentItemVariableName` delegate argument (default: `CurrentEmail`).
- The current index is available via `CurrentEmailIndex`.
