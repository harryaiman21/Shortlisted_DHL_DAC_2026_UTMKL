# Event Replied

`EventReplied`

Trigger that fires when an attendee replies to a Google Calendar event. Used as a trigger in Orchestrator-managed processes.

**Package:** `UiPath.GSuite.Activities`
**Category:** Calendar
**Connector:** `uipath-google-gmail`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Calendar` | Calendar | `Property` | [`TriggerCalendarArgument`](components/TriggerCalendarArgument.md) | No | | The Google Calendar to monitor for event replies. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google connection to use. |
| `Filter` | Filter | [`TriggerEventFilterCollection`](filtering/TriggerEventFilterCollection.md) | | Condition-based filter for matching replied events. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `Result` | Result | `OutArgument` | [`GSuiteEventItem`](types/GSuiteEventItem.md) | The replied event that activated the trigger. |

## Output Model

Returns a [`GSuiteEventItem`](types/GSuiteEventItem.md) with full event details.

## Notes

- This is a trigger activity designed for use with Orchestrator trigger-based processes.
- In debug mode, retrieves a sample event matching the criteria.
- Only supported with Connection Service authentication.
