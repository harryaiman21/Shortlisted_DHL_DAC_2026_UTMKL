# Get Gmail Labels List

`GetGmailLabelsListConnections`

Retrieves a list of all Gmail labels for the authenticated user.

**Package:** `UiPath.GSuite.Activities`
**Category:** Gmail
**Connector:** `uipath-google-gmail`

## Properties

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google connection to use. |

### Output

This activity extends `GoogleBaseActivity<List<GmailLabelItem>>` and returns a `List<`[`GmailLabelItem`](types/GmailLabelItem.md)`>` as its `Result` property.

## Output Model

Returns a `List<`[`GmailLabelItem`](types/GmailLabelItem.md)`>` containing all Gmail labels.

## Notes

- No input properties are required; the activity retrieves all labels for the authenticated account.
