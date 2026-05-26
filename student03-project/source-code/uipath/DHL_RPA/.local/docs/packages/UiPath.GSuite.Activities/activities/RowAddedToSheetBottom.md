# Row Added to Sheet Bottom

`UiPath.GSuite.Activities.Sheets.Triggers.RowAddedToSheetBottom`

Trigger activity that fires when a new row is added to the bottom of a specified sheet in a Google Sheets spreadsheet.

**Package:** `UiPath.GSuite.Activities`
**Category:** Google Sheets
**Connector:** `uipath-google-sheets`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `DriveItem` | Spreadsheet | `Property` | `TriggerDriveItemArgument` | Yes | | The spreadsheet to monitor. Configured through the Studio designer. |
| `SheetName` | Sheet Name | `Property` | `String` | Yes | | The monitored sheet name. |
| `HasHeaders` | Has Headers | `Property` | `Boolean` | | `true` | Specifies whether the first row in the Sheet has headers. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `AddedRow` | Added Row | `OutArgument` | `DataRow` | The row that was added to the sheet. |
| `Spreadsheet` | Spreadsheet | `OutArgument` | [`GDriveRemoteItem`](types/GDriveRemoteItem.md) | The Google spreadsheet file containing the new row. |
| `JobData` | Job Data | `OutArgument` | `JobInformation` | Metadata about the triggering job. |

## XAML Example

```xml
<triggers:RowAddedToSheetBottom
    x:TypeArguments="sd:DataRow"
    DisplayName="Row Added to Sheet Bottom"
    SheetName="Orders"
    HasHeaders="True"
    AddedRow="[newRow]"
    Spreadsheet="[spreadsheet]"
    JobData="[jobData]"
    xmlns:triggers="clr-namespace:UiPath.GSuite.Activities.Sheets.Triggers;assembly=UiPath.GSuite.Activities" />
```

## Notes

- This is a trigger activity used in trigger-based workflows. It activates when a new row is appended to the bottom of the monitored sheet.
- The `RowAddedToSheetBottom` class is generic (`RowAddedToSheetBottom<T>` where `T : DataRow`). Use `x:TypeArguments` in XAML.
- The spreadsheet is selected via a `TriggerDriveItemArgument`, configured through the Studio designer.
- Column headers are validated at design time when `HasHeaders` is `true`.
- Only supported with connection service (not legacy authentication).
