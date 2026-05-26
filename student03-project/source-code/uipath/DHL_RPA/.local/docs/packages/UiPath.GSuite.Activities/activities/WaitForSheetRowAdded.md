# Wait For Sheet Row Added

`UiPath.GSuite.Activities.WaitForSheetRowAdded`

Pauses the workflow until a new row is added to a specified sheet in a Google Sheets spreadsheet.

**Package:** `UiPath.GSuite.Activities`
**Category:** Google Sheets
**Connector:** `uipath-google-sheets`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | Spreadsheet | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | Yes | | The spreadsheet to monitor. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |
| `SheetName` | Sheet Name | `InArgument` | `String` | Yes | | The monitored sheet name. |
| `HasHeaders` | Has Headers | `Property` | `Boolean` | | `true` | Specifies whether the first row in the Sheet has headers. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `AddedRow` | Added Row | `OutArgument` | `DataRow` | The data of the newly added row. |
| `Result` | Spreadsheet | `OutArgument` | [`GDriveRemoteItem`](types/GDriveRemoteItem.md) | The spreadsheet containing the new row. |
| `JobData` | Job Data | `OutArgument` | `JobInformation` | Metadata about the job that triggered this activity. |

## XAML Example

```xml
<gsuite:WaitForSheetRowAdded
    x:TypeArguments="sd:DataRow"
    DisplayName="Wait For Sheet Row Added"
    Item.InputMode="UrlOrId"
    Item.IdOrUrl="[spreadsheetId]"
    SheetName="[&quot;Orders&quot;]"
    HasHeaders="True"
    AddedRow="[newRow]"
    Result="[spreadsheet]"
    JobData="[jobData]" />
```

## Notes

- This is a persistence activity -- the workflow suspends and resumes when the trigger condition is met.
- The `WaitForSheetRowAdded` class is generic (`WaitForSheetRowAdded<T>` where `T : DataRow`). Use `x:TypeArguments` in XAML.
- Only supported with connection service (not legacy authentication).
