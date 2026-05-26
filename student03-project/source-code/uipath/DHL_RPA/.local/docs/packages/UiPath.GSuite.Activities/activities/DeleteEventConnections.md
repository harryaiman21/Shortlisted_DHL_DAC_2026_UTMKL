# Delete Event

`DeleteEventConnections`

Deletes an event from Google Calendar.

**Package:** `UiPath.GSuite.Activities`
**Category:** Calendar
**Connector:** `uipath-google-gmail`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Event` | Event | `InArgument` | [`GSuiteEventItem`](types/GSuiteEventItem.md) | Yes | | The event to delete. |
| `DeleteType` | Delete Type | `InArgument` | [`DeleteEventType`](#enum-reference) | No | `SingleEvent` | The scope of deletion for recurring events. |
| `SendNotification` | Send Notification | `InArgument` | [`SendUpdates`](#enum-reference) | No | `ALL` | Whether to send cancellation notifications. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google connection to use. |

## Enum Reference

| Enum | Values |
|------|--------|
| [`DeleteEventType`] | `SingleEvent`, `FutureOnly`, `PastAndFuture` |
| [`SendUpdates`] | `ALL`, `EXTERNAL_ONLY`, `NONE` |

## Notes

- The `Event` property is required.
