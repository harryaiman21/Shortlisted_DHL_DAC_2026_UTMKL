# Wait For Sheet Cell Updated

`UiPath.GSuite.Activities.WaitForSheetCellUpdated`

Pauses the workflow until a specific cell in a Google Sheets spreadsheet is updated. This is a persistence activity -- the workflow suspends and resumes when the trigger condition is met.

**Package:** `UiPath.GSuite.Activities`
**Category:** Google Sheets
**Connector:** `uipath-google-sheets`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | Spreadsheet | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | Yes | | The spreadsheet to monitor. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |
| `SheetName` | Sheet Name | `InArgument` | `String` | Yes | | The monitored sheet. |
| `CellAddress` | Cell Address | `InArgument` | `String` | Yes | | The monitored cell address (e.g. `A1`). |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `UpdatedCell` | Updated Cell | `OutArgument` | `CellInformation` | Information about the updated cell including address and new value. |
| `Result` | Spreadsheet | `OutArgument` | [`GDriveRemoteItem`](types/GDriveRemoteItem.md) | The spreadsheet containing the updated cell. |
| `JobData` | Job Data | `OutArgument` | `JobInformation` | Metadata about the job that triggered this activity. |

## XAML Example

```xml
<gsuite:WaitForSheetCellUpdated
    DisplayName="Wait For Sheet Cell Updated"
    Item.InputMode="UrlOrId"
    Item.IdOrUrl="[spreadsheetId]"
    SheetName="[&quot;Sheet1&quot;]"
    CellAddress="[&quot;B5&quot;]"
    UpdatedCell="[cellInfo]"
    Result="[spreadsheet]"
    JobData="[jobData]" />
```

## Notes

- This is a persistence activity -- the workflow suspends and resumes when the trigger condition is met.
- Only supported with connection service (not legacy authentication).
