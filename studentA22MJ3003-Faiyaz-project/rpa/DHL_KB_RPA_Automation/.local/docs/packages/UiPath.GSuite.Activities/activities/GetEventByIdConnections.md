# Get Event by ID

`GetEventByIdConnections`

Retrieves a Google Calendar event by its unique identifier.

**Package:** `UiPath.GSuite.Activities`
**Category:** Calendar
**Connector:** `uipath-google-gmail`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `CalendarArgument` | Calendar | `Property` | [`CalendarArgument`](components/CalendarArgument.md) | No | | The target calendar. See [CalendarArgument](components/CalendarArgument.md) for input modes. |
| `EventId` | Event Id | `InArgument` | `string` | Yes | | The unique identifier of the event to retrieve. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google connection to use. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `Event` | Event | `OutArgument` | [`GSuiteEventItem`](types/GSuiteEventItem.md) | The retrieved event. |

## Output Model

Returns a [`GSuiteEventItem`](types/GSuiteEventItem.md) matching the specified event ID.

## Notes

- The `EventId` property is required.
