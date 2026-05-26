# Get Gmail Label

`GetGmailLabelConnections`

Retrieves the Gmail label with the specified ID, including message/thread counts and visibility settings.

**Package:** `UiPath.GSuite.Activities`
**Category:** Gmail
**Connector:** `uipath-google-gmail`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `LabelId` | Label Id | `InArgument` | `string` | Yes | | The unique identifier of the Gmail label. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google connection to use. |

### Output

This activity extends `GoogleBaseActivity<GmailFullLabelItem>` and returns a [`GmailFullLabelItem`](types/GmailFullLabelItem.md) as its `Result` property.

## Output Model

Returns a [`GmailFullLabelItem`](types/GmailFullLabelItem.md) with label details including name, ID, message count, and visibility settings.

## Notes

- The `LabelId` property is required.
