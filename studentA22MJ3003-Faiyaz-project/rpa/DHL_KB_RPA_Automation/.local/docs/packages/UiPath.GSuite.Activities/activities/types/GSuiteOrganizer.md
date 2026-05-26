# GSuiteOrganizer

`UiPath.GSuite.Calendar.Models.GSuiteOrganizer`

Represents the organizer of a Google Calendar event.

**Assembly:** `UiPath.GSuite`

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `DisplayName` | `string` | Display name of the organizer. |
| `Email` | `string` | Email address of the organizer. |
| `Id` | `string` | The organizer's Profile ID, if available. |
| `Self` | `bool?` | Whether the organizer corresponds to the calendar on which this copy of the event appears. The default is False. |

## Notes

- This type is used as the `Organizer` property of [GSuiteEventItem](GSuiteEventItem.md).
- The `Self` property is useful for determining if the event was organized by the calendar owner.

## Used By

Activities that return or accept this type -- see activity docs for details.
