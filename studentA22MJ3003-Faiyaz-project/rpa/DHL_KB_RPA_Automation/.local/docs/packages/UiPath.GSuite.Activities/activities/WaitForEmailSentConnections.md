# Wait For Email Sent

`WaitForEmailSentConnections`

Suspends workflow execution until an email matching the specified criteria is sent from Gmail, then resumes with the sent email.

**Package:** `UiPath.GSuite.Activities`
**Category:** Gmail
**Connector:** `uipath-google-gmail`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `WithAttachmentsOnly` | With Attachments Only | `Property` | `bool` | No | `false` | Only trigger for sent emails with attachments. |
| `IncludeAttachments` | Include Attachments | `InArgument` | `bool` | No | `false` | Whether the returned email should include attachment data. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google connection to use. |
| `Filter` | Filter | [`TriggerMailFilterWithVariablesCollection`](filtering/TriggerMailFilterWithVariablesCollection.md) | | Condition-based filter for matching sent emails. |

### Output

The activity returns a [`GmailMessage`](types/GmailMessage.md) as its `Result` property.

## Output Model

Returns a [`GmailMessage`](types/GmailMessage.md) with the sent email details.

## Notes

- This is a persistence (long-running) activity. It suspends workflow execution and resumes when a matching sent email is detected.
- Only supported with Connection Service authentication.
- In debug mode, retrieves a sample sent email matching the criteria instead of waiting.
