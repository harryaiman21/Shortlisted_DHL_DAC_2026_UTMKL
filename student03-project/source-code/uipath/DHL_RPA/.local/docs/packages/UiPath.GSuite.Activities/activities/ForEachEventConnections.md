# For Each Event

`ForEachEventConnections`

Iterates over a collection of Google Calendar events within a specified date range, executing contained activities for each event.

**Package:** `UiPath.GSuite.Activities`
**Category:** Calendar
**Connector:** `uipath-google-gmail`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `CalendarArgument` | Calendar | `Property` | [`CalendarArgument`](components/CalendarArgument.md) | No | | The target calendar. See [CalendarArgument](components/CalendarArgument.md) for input modes. |
| `StartDate` | Start Date | `InArgument` | `DateTimeOffset` | Yes | | The start of the date range to search. |
| `EndDate` | End Date | `InArgument` | `DateTimeOffset` | Yes | | The end of the date range to search. |
| `CurrentItemVariableName` | Current Item Variable Name | `Property` | `string` | Yes | `CurrentEvent` | Identifier for the current [`GSuiteEventItem`](types/GSuiteEventItem.md) in the iteration. |
| `MaxResults` | Max Results | `InArgument` | `int` | No | `50` | The maximum number of events to iterate through. |
| `PreferredReturnTimezone` | Preferred Return Timezone | `InArgument` | `string` | No | `UTC` | Timezone for the returned events. |
| `SimpleSearch` | Simple Search | `InArgument` | `string` | No | | Text to filter within calendar events. |
| `ReturnRecurring` | Return Recurring | `InArgument` | `bool` | No | `true` | Whether to return individual recurring event instances. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google connection to use. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `Length` | Length | `OutArgument` | `int` | The number of events processed. |

## Notes

- `StartDate` and `EndDate` are required.
- This is a container activity; the `Body` contains the activities to execute for each [`GSuiteEventItem`](types/GSuiteEventItem.md).
- The current event is available via the `CurrentItemVariableName` delegate argument (default: `CurrentEvent`).
- The current index is available via `CurrentEventIndex`.
