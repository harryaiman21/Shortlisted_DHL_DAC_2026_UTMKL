# Get Calendars

`GetCalendarsConnections`

Retrieves the list of Google Calendars accessible to the authenticated user.

**Package:** `UiPath.GSuite.Activities`
**Category:** Calendar
**Connector:** `uipath-google-gmail`

## Properties

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google connection to use. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `Calendars` | Calendars | `OutArgument` | `List<`[`GSuiteCalendarItem`](types/GSuiteCalendarItem.md)`>` | The list of calendars. |
| `DefaultCalendar` | Default Calendar | `OutArgument` | [`GSuiteCalendarItem`](types/GSuiteCalendarItem.md) | The user's primary calendar. |

## Output Model

Returns a `List<`[`GSuiteCalendarItem`](types/GSuiteCalendarItem.md)`>` and the primary [`GSuiteCalendarItem`](types/GSuiteCalendarItem.md).

## Notes

- No input properties are required.
