# Wait For Event Updated and Resume

`WaitForEventUpdated`

Suspends workflow execution until a Google Calendar event is updated matching the specified criteria, then resumes with the updated event.

**Package:** `UiPath.GSuite.Activities`
**Category:** Calendar
**Connector:** `uipath-google-gmail`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `CalendarArgument` | Calendar | `Property` | [`CalendarArgument`](components/CalendarArgument.md) | No | | The target calendar to monitor. See [CalendarArgument](components/CalendarArgument.md) for input modes. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google connection to use. |
| `Filter` | Filter | [`EventFilterWithVariablesCollection`](filtering/EventFilterWithVariablesCollection.md) | | Condition-based filter for matching updated events. |

### Output

The activity returns a [`GSuiteEventItem`](types/GSuiteEventItem.md) as its `Result` property.

## Output Model

Returns a [`GSuiteEventItem`](types/GSuiteEventItem.md) with the updated event details.

## Notes

- This is a persistence (long-running) activity. It suspends workflow execution and resumes when a matching event update is detected.
- Only supported with Connection Service authentication.
- In debug mode, retrieves a sample event matching the criteria instead of waiting.
