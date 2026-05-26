# DateTimeTimeZone

`UiPath.GSuite.Calendar.Models.DateTimeTimeZone`

Represents a date/time value paired with its timezone. Used by [GSuiteEventItem](GSuiteEventItem.md) to express event start and end times with timezone context.

**Assembly:** `UiPath.GSuite`

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `DateTime` | `DateTime` | The date and time value. |
| `TimeZone` | `string` | The timezone identifier (e.g., "America/New_York", "Europe/London"). |

## Notes

- This type is used as the `Start` and `End` properties of [GSuiteEventItem](GSuiteEventItem.md).
- The `TimeZone` string follows the IANA Time Zone Database format.

## Used By

Activities that return or accept this type -- see activity docs for details.
