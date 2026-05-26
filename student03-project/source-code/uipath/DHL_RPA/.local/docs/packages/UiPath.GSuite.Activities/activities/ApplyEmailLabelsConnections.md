# Apply Email Labels

`ApplyEmailLabelsConnections`

Applies one or more labels to an email in Gmail.

**Package:** `UiPath.GSuite.Activities`
**Category:** Gmail
**Connector:** `uipath-google-gmail`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Email` | Email | `InArgument` | [`GmailMessage`](types/GmailMessage.md) | Yes | | The email to modify labels on. |
| `LabelSelectionMode` | Label Selection Mode | `Property` | [`LabelInputMode`](#enum-reference) | No | | Labels input mode (multi-select from browser or variable). |
| `SelectedLabels` | Selected Labels | `Property` | `string` | Conditional | | The list of selected labels (serialized). Used with `MultiSelect` mode. |
| `ManualEntrySelectedLabels` | Manual Entry Selected Labels | `InArgument` | `IEnumerable<string>` | Conditional | | The list of label names provided as a variable. Used with `Variable` mode. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google connection to use. |

## Enum Reference

| Enum | Values |
|------|--------|
| [`LabelInputMode`] | `MultiSelect`, `Variable` |

## Notes

- The `Email` property is required.
- Either `SelectedLabels` (MultiSelect mode) or `ManualEntrySelectedLabels` (Variable mode) must be provided depending on the `LabelSelectionMode`.
