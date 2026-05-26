# Forward Email

`ForwardEmailConnections`

Forwards an existing Gmail email to new recipients. Supports modifying the subject, adding a body, attachments, and saving as draft.

**Package:** `UiPath.GSuite.Activities`
**Category:** Gmail
**Connector:** `uipath-google-gmail`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Email` | Email | `InArgument` | [`GmailMessage`](types/GmailMessage.md) | Yes | | The email to forward. |
| `To` | To | `InArgument` | `IEnumerable<string>` | Yes | | The primary recipients of the forwarded email. |
| `Cc` | CC | `InArgument` | `IEnumerable<string>` | No | | The CC recipients. |
| `Bcc` | BCC | `InArgument` | `IEnumerable<string>` | No | | The BCC recipients. |
| `Body` | Body | `InArgument` | `string` | No | | Additional body content to include (HTML). |
| `NewSubject` | New Subject | `InArgument` | `string` | No | | A new subject line. If left blank, the original subject is used. |
| `SaveAsDraft` | Save As Draft | `InArgument` | `bool` | No | `true` | When true, saves as draft instead of sending. |
| `AttachmentInputMode` | Attachment Input Mode | `Property` | [`AttachmentInputMode`](#enum-reference) | No | `UseExisting` | Specifies how attachments are provided. |
| `Attachments` | Attachments | `InArgument` | `IEnumerable<IResource>` | No | | The attachments to send with the forwarded email. |
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
| [`AttachmentInputMode`] | `UseExisting`, `Builder`, `UseSingle`, `FilePaths`, `FilePathsBuilder` |

## Notes

- Both `Email` and `To` are required.
- The forwarded body is always sent as HTML.
- When `SaveAsDraft` is `false`, governance email block-list validation is applied.
