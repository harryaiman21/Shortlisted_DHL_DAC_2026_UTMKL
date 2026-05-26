# Get Event List

`GetEventListConnections`

Retrieves a list of events from a Google Calendar within a specified date range.

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
| `MaxResults` | Max Results | `InArgument` | `int` | No | `50` | The maximum number of events to retrieve. If 0 or negative, all matching events are returned. |
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
| `EventList` | Event List | `OutArgument` | `List<`[`GSuiteEventItem`](types/GSuiteEventItem.md)`>` | The retrieved event list. |

## Output Model

Returns a `List<`[`GSuiteEventItem`](types/GSuiteEventItem.md)`>` with event details.

## Notes

- `StartDate` and `EndDate` are required.
