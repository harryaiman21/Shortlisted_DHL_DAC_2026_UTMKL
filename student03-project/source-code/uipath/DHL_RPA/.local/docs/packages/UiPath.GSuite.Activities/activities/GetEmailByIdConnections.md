# Get Email By Id

`GetEmailByIdConnections`

Retrieves the email with the specified ID from Gmail.

**Package:** `UiPath.GSuite.Activities`
**Category:** Gmail
**Connector:** `uipath-google-gmail`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `EmailId` | Email Id | `InArgument` | `string` | Yes | | The unique identifier of the email. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google connection to use. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `Result` | Result | `OutArgument` | [`GmailMessage`](types/GmailMessage.md) | The email returned by the activity. |

## Output Model

Returns a [`GmailMessage`](types/GmailMessage.md) with email details including subject, body, sender, recipients, and metadata.

## Notes

- The `EmailId` property is required.
- Does not include attachments in the returned message by default.
