# Forward Event

`ForwardEventConnections`

Forwards a Google Calendar event to additional attendees.

**Package:** `UiPath.GSuite.Activities`
**Category:** Calendar
**Connector:** `uipath-google-gmail`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Event` | Event | `InArgument` | [`GSuiteEventItem`](types/GSuiteEventItem.md) | Yes | | The event to forward. |
| `Attendees` | Attendees | `InArgument` | `IEnumerable<string>` | Yes | | The email addresses of attendees to forward the event to. |
| `ApplyOnSeries` | Apply On Series | `InArgument` | `bool` | No | `false` | Whether to forward the entire recurring series or just the single instance. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google connection to use. |

## Notes

- Both `Event` and `Attendees` are required.
- Governance email block-list validation is applied to attendees.
