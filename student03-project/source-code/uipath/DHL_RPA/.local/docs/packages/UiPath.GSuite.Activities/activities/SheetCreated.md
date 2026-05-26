# Sheet Created

`UiPath.GSuite.Activities.Sheets.Triggers.SheetCreated`

Trigger activity that fires when a new sheet (tab) is created in a Google Sheets spreadsheet.

**Package:** `UiPath.GSuite.Activities`
**Category:** Google Sheets
**Connector:** `uipath-google-sheets`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `DriveItem` | Spreadsheet | `Property` | `TriggerDriveItemArgument` | Yes | | The spreadsheet to monitor. Configured through the Studio designer. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `SheetName` | Sheet Name | `OutArgument` | `String` | The name of the created sheet. |
| `Spreadsheet` | Spreadsheet | `OutArgument` | [`GDriveRemoteItem`](types/GDriveRemoteItem.md) | The Google spreadsheet file in which the sheet was created. |
| `JobData` | Job Data | `OutArgument` | `JobInformation` | Metadata about the triggering job. |

## XAML Example

```xml
<triggers:SheetCreated
    DisplayName="Sheet Created"
    SheetName="[newSheetName]"
    Spreadsheet="[spreadsheet]"
    JobData="[jobData]"
    xmlns:triggers="clr-namespace:UiPath.GSuite.Activities.Sheets.Triggers;assembly=UiPath.GSuite.Activities" />
```

## Notes

- This is a trigger activity used in trigger-based workflows. It activates when a new sheet is added to the monitored spreadsheet.
- The spreadsheet is selected via a `TriggerDriveItemArgument`, configured through the Studio designer.
- Only supported with connection service (not legacy authentication).
