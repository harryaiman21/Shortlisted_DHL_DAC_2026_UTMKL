# New Email Received

`NewEmailReceived`

Trigger that fires when a new email is received in a specified Gmail folder. Used as a trigger in Orchestrator-managed processes.

**Package:** `UiPath.GSuite.Activities`
**Category:** Gmail
**Connector:** `uipath-google-gmail`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Folder` | Folder | `Property` | [`TriggerFolderArgument`](components/TriggerFolderArgument.md) | No | | The Gmail label/folder to monitor for new incoming emails. |
| `WithAttachmentsOnly` | With Attachments Only | `Property` | `bool` | No | `false` | Retrieve only emails with attachments. |
| `IncludeAttachments` | Include Attachments | `InArgument` | `bool` | No | `false` | Whether the returned email should include attachment data. |
| `MarkAsRead` | Mark As Read | `InArgument` | `bool` | No | `false` | Mark the received email as read after retrieval. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google connection to use. |
| `Filter` | Filter | [`TriggerMailFilterCollection`](filtering/TriggerMailFilterCollection.md) | | Condition-based filter for matching received emails. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `Result` | Result | `OutArgument` | [`GmailMessage`](types/GmailMessage.md) | The received email that activated the trigger. |

## Output Model

Returns a [`GmailMessage`](types/GmailMessage.md) with full email details.

## Notes

- This is a trigger activity designed for use with Orchestrator trigger-based processes.
- In debug mode, retrieves a sample email matching the criteria.
- Only supported with Connection Service authentication.
