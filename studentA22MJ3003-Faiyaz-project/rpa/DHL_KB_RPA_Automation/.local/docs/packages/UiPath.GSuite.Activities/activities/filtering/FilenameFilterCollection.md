# FilenameFilterCollection

`UiPath.GSuite.Activities.Gmail.Filters.FilenameFilterCollection`

A filter collection for filtering Gmail email attachments by filename or file type. Used to narrow down which attachments to download from emails.

**Assembly:** `UiPath.GSuite.Activities`
**Inherits:** `BaseFilterCollection<FilenameFilterElement, MailFilterLogicalOperator>`

## Structure

A `FilenameFilterCollection` contains:
- A `LogicalOperator` that determines how multiple filters combine (AND/OR).
- A `Filters` list of `FilenameFilterElement` instances.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `LogicalOperator` | `MailFilterLogicalOperator` | How to combine multiple filter conditions. |
| `Filters` | `List<FilenameFilterElement>` | The list of filter elements to apply. |

## MailFilterLogicalOperator Enum

| Value | Description |
|-------|-------------|
| `And` | All filters must match (intersection). |
| `Or` | Any filter may match (union). |

## FilenameFilterElement

Each element represents a single filter condition on an attachment property.

| Property | Type | Description |
|----------|------|-------------|
| `Criteria` | `MailAttachmentFilterField` | The attachment field to filter on. |
| `StringOperator` | `MailAttachmentStringFilterOperator` | The string comparison operator. |
| `Value` | `InArgument<string>` | String value for comparison. |

## MailAttachmentFilterField Enum

| Value | Description |
|-------|-------------|
| `Filename` | Filter by the attachment filename. |
| `Filetype` | Filter by the attachment file type/extension. |

## MailAttachmentStringFilterOperator Enum

| Value | Description |
|-------|-------------|
| `Contains` | Filename/type contains the specified text. |
| `NotContains` | Filename/type does not contain the specified text. |
| `Equals` | Filename/type equals the specified text. |
| `NotEquals` | Filename/type does not equal the specified text. |
| `StartsWith` | Filename/type starts with the specified text. |
| `EndsWith` | Filename/type ends with the specified text. |

## Used By

Gmail attachment download activities -- see activity docs for details.
