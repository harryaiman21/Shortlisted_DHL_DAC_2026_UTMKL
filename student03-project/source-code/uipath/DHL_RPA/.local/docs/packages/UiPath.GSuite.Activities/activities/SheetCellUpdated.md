# Sheet Cell Updated

`UiPath.GSuite.Activities.Sheets.Triggers.SheetCellUpdated`

Trigger activity that fires when a specific cell in a Google Sheets spreadsheet is updated.

**Package:** `UiPath.GSuite.Activities`
**Category:** Google Sheets
**Connector:** `uipath-google-sheets`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `DriveItem` | Spreadsheet | `Property` | `TriggerDriveItemArgument` | Yes | | The spreadsheet to monitor. Configured through the Studio designer. |
| `SheetName` | Sheet Name | `Property` | `String` | Yes | | The monitored sheet. |
| `CellAddress` | Cell Address | `Property` | `String` | Yes | | The monitored cell address (e.g. `A1`). |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `UpdatedCell` | Updated Cell | `OutArgument` | `CellInformation` | Information about the updated cell. |
| `Spreadsheet` | Spreadsheet | `OutArgument` | [`GDriveRemoteItem`](types/GDriveRemoteItem.md) | The Google spreadsheet file containing the updated cell. |
| `JobData` | Job Data | `OutArgument` | `JobInformation` | Metadata about the triggering job. |

## XAML Example

```xml
<triggers:SheetCellUpdated
    DisplayName="Sheet Cell Updated"
    SheetName="Sheet1"
    CellAddress="B5"
    UpdatedCell="[cellInfo]"
    Spreadsheet="[spreadsheet]"
    JobData="[jobData]"
    xmlns:triggers="clr-namespace:UiPath.GSuite.Activities.Sheets.Triggers;assembly=UiPath.GSuite.Activities" />
```

## Notes

- This is a trigger activity used in trigger-based workflows.
- The spreadsheet is selected via a `TriggerDriveItemArgument`, configured through the Studio designer.
- Only supported with connection service (not legacy authentication).
