# Email Sent

`EmailSent`

Trigger that fires when an email is sent from the authenticated Gmail account. Used as a trigger in Orchestrator-managed processes.

**Package:** `UiPath.GSuite.Activities`
**Category:** Gmail
**Connector:** `uipath-google-gmail`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `WithAttachmentsOnly` | With Attachments Only | `Property` | `bool` | No | `false` | Retrieve only sent emails with attachments. |
| `IncludeAttachments` | Include Attachments | `InArgument` | `bool` | No | `false` | Whether the returned email should include attachment data. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google connection to use. |
| `Filter` | Filter | [`TriggerMailFilterCollection`](filtering/TriggerMailFilterCollection.md) | | Condition-based filter for matching sent emails. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `Result` | Result | `OutArgument` | [`GmailMessage`](types/GmailMessage.md) | The sent email that activated the trigger. |

## Output Model

Returns a [`GmailMessage`](types/GmailMessage.md) with full email details.

## Notes

- This is a trigger activity designed for use with Orchestrator trigger-based processes.
- In debug mode, retrieves a sample sent email matching the criteria.
- Only supported with Connection Service authentication.
