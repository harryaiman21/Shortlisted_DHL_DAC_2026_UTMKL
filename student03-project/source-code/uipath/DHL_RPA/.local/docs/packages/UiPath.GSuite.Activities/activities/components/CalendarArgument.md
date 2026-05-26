# CalendarArgument

`UiPath.GSuite.Activities.Calendar.Models.CalendarArgument`

A composition component used by Google Calendar activities to specify a target calendar. Supports browsing for a calendar or using an existing [GSuiteCalendarItem](../types/GSuiteCalendarItem.md) variable.

**Assembly:** `UiPath.GSuite.Activities`
**Inherits:** `BaseCalendarArgument`

## InputMode (`ECalendarMode`)

Determines which properties are active.

| Mode | Value | Description | AI-XAML Suitable |
|------|-------|-------------|------------------|
| `Browse` | `0` | Select a calendar from the remote browser in Studio. | **Not suitable for AI-generated XAML** -- requires interactive Studio UI. |
| `UseExisting` | `1` | Use an existing [`GSuiteCalendarItem`](../types/GSuiteCalendarItem.md) reference. | Yes |

## Properties

| Property | Type | Mode(s) | Description |
|----------|------|---------|-------------|
| `InputMode` | `ECalendarMode` | All | Determines how the calendar is specified. |
| `Existing` | `InArgument<`[`GSuiteCalendarItem`](../types/GSuiteCalendarItem.md)`>` | UseExisting | An existing calendar reference to use as the target. |
| `BrowserId` | `InArgument<string>` | Browse | The calendar identifier persisted after the user selects a calendar via the remote browser. |
| `FriendlyName` | `InArgument<string>` | Browse | The display name of the selected calendar (e.g., "My Calendar"). Used as a fallback to resolve by name when `BrowserId` is no longer valid after a connection change. |
| `ConnectionKey` | `string` | All | The identifier of the connection that was active when the calendar was selected. Used to detect connection changes for re-resolution. |
| `ConnectionDescriptor` | `string` | All | A human-readable label describing the connection (e.g., account email). |
| `Backup` | `BackupSlot<ECalendarMode>` | All | Stores the previous InputMode value so the designer can revert when switching modes. |

## XAML Examples

### UseExisting Mode

```xml
<CalendarArgument InputMode="UseExisting">
  <CalendarArgument.Existing>
    <InArgument x:TypeArguments="calendar:GSuiteCalendarItem">[MyCalendarVariable]</InArgument>
  </CalendarArgument.Existing>
</CalendarArgument>
```

## Notes

- When no calendar is specified (empty `BrowserId` in Browse mode), the default calendar (primary) is used.
- When the connection changes, Browse mode attempts to re-resolve the calendar by verifying the `BrowserId`, then falls back to searching by `FriendlyName`.
- `BrowserId` has the `[AutopilotIgnored]` attribute -- it is a regular property but is typically populated by the Studio browser, not by users directly.

## Used By

Google Calendar activities that need a calendar reference -- see activity docs for details.
