# Reply To Email

`ReplyToEmailConnections`

Replies to an existing Gmail email. Supports adding new recipients, attachments, and saving as draft.

**Package:** `UiPath.GSuite.Activities`
**Category:** Gmail
**Connector:** `uipath-google-gmail`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Email` | Email | `InArgument` | [`GmailMessage`](types/GmailMessage.md) | Yes | | The email to reply to. |
| `Body` | Body | `InArgument` | `string` | No | | The HTML body of the reply. |
| `NewSubject` | New Subject | `InArgument` | `string` | No | | The new subject. If left blank, the original subject is used. |
| `To` | To | `InArgument` | `IEnumerable<string>` | No | | Additional primary recipients. |
| `Cc` | CC | `InArgument` | `IEnumerable<string>` | No | | Additional CC recipients. |
| `Bcc` | BCC | `InArgument` | `IEnumerable<string>` | No | | Additional BCC recipients. |
| `Importance` | Importance | `InArgument` | [`MailImportance`](#enum-reference) | No | `Normal` | The importance level of the reply. |
| `SaveAsDraft` | Save As Draft | `InArgument` | `bool` | No | `true` | When true, saves the reply as a draft instead of sending it. |
| `ReplyToAll` | Reply To All | `InArgument` | `bool` | No | `false` | When true, replies to all original recipients. |
| `AttachmentInputMode` | Attachment Input Mode | `Property` | [`AttachmentInputMode`](#enum-reference) | No | `UseExisting` | Specifies how attachments are provided. |
| `Attachments` | Attachments | `InArgument` | `IEnumerable<IResource>` | No | | The attachments to send with the reply. |
| `ArgumentAttachments` | Argument Attachments | `Property` | `IEnumerable<InArgument<IResource>>` | No | | List of individual attachment resources for builder mode. |
| `AttachmentPaths` | Attachment Paths | `InArgument` | `IEnumerable<string>` | No | | File paths of attachments. |
| `ArgumentAttachmentPaths` | Argument Attachment Paths | `Property` | `IEnumerable<InArgument<string>>` | No | | List of individual file path arguments for builder mode. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google connection to use. |

## Enum Reference

| Enum | Values |
|------|--------|
| [`MailImportance`] | `Low`, `Normal`, `High` |
| [`AttachmentInputMode`] | `UseExisting`, `Builder`, `UseSingle`, `FilePaths`, `FilePathsBuilder` |

## Notes

- The `Email` property is required and must be a [`GmailMessage`](types/GmailMessage.md) obtained from a previous activity.
- The reply body is always sent as HTML.
- When `SaveAsDraft` is `false`, governance email block-list validation is applied.
