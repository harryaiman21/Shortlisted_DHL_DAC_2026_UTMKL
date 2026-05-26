# Get Email Thread

`GetEmailThreadConnections`

Retrieves the list of emails in the specified Gmail thread.

**Package:** `UiPath.GSuite.Activities`
**Category:** Gmail
**Connector:** `uipath-google-gmail`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `ThreadId` | Thread Id | `InArgument` | `string` | Yes | | The unique identifier of the thread. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google connection to use. |

### Output

This activity extends `GoogleBaseActivity<List<GmailMessage>>` and returns a `List<`[`GmailMessage`](types/GmailMessage.md)`>` as its `Result` property.

## Output Model

Returns a `List<`[`GmailMessage`](types/GmailMessage.md)`>` containing all messages in the thread.

## Notes

- The `ThreadId` property is required.
