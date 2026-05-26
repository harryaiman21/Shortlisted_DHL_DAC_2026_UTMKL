# Wait For Email Received

`WaitForEmailReceivedConnections`

Suspends workflow execution until a new email matching the specified criteria is received in Gmail, then resumes with the received email.

**Package:** `UiPath.GSuite.Activities`
**Category:** Gmail
**Connector:** `uipath-google-gmail`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Folder` | Folder | `Property` | [`FolderArgument`](components/FolderArgument.md) | No | | The Gmail label/folder to monitor. See [FolderArgument](components/FolderArgument.md) for input modes. |
| `WithAttachmentsOnly` | With Attachments Only | `Property` | `bool` | No | `false` | Only trigger for emails with attachments. |
| `IncludeAttachments` | Include Attachments | `InArgument` | `bool` | No | `false` | Whether the returned email should include attachment data. |
| `MarkAsRead` | Mark As Read | `InArgument` | `bool` | No | `false` | Mark the received email as read after retrieval. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google connection to use. |
| `Filter` | Filter | [`TriggerMailFilterWithVariablesCollection`](filtering/TriggerMailFilterWithVariablesCollection.md) | | Condition-based filter for matching incoming emails. |

### Output

The activity returns a [`GmailMessage`](types/GmailMessage.md) as its `Result` property.

## Output Model

Returns a [`GmailMessage`](types/GmailMessage.md) with the received email details.

## Notes

- This is a persistence (long-running) activity. It suspends workflow execution and resumes when a matching email arrives.
- Only supported with Connection Service authentication.
- In debug mode, retrieves a sample email matching the criteria instead of waiting.
