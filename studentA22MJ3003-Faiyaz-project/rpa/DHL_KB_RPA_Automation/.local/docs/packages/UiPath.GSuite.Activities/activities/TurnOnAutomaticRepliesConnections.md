# Turn On Automatic Replies

`TurnOnAutomaticRepliesConnections`

Activates and configures Gmail vacation/out-of-office automatic replies.

**Package:** `UiPath.GSuite.Activities`
**Category:** Gmail
**Connector:** `uipath-google-gmail`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `StartTime` | Start Time | `InArgument` | `DateTimeOffset` | No | | The date and time when the Out of Office starts. |
| `EndTime` | End Time | `InArgument` | `DateTimeOffset` | No | | The date and time when the Out of Office ends. |
| `MessageBodyHtml` | Message Body HTML | `InArgument` | `string` | No | | The automatic reply message body (HTML). At least one of MessageBodyHtml or MessageSubject is required. |
| `MessageSubject` | Message Subject | `InArgument` | `string` | No | | The automatic reply subject line. At least one of MessageBodyHtml or MessageSubject is required. |
| `SendRepliesOutsideOrganization` | Send Replies Outside Organization | `InArgument` | `bool` | No | `false` | Whether automatic replies can be sent to users outside the organization. |
| `SendRepliesToContactsOnly` | Send Replies To Contacts Only | `InArgument` | `bool` | No | `false` | Whether to send automatic replies only to contacts when replying to users outside the organization. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google connection to use. |

## Notes

- At least one of `MessageBodyHtml` or `MessageSubject` must be provided.
