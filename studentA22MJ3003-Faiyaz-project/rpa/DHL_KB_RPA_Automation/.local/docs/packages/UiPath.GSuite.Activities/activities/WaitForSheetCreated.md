# Wait For Sheet Created

`UiPath.GSuite.Activities.WaitForSheetCreated`

Pauses the workflow until a new sheet (tab) is created in a Google Sheets spreadsheet.

**Package:** `UiPath.GSuite.Activities`
**Category:** Google Sheets
**Connector:** `uipath-google-sheets`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | Spreadsheet | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | Yes | | The spreadsheet to monitor. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `SheetName` | Sheet Name | `OutArgument` | `String` | The name of the newly created sheet. |
| `Result` | Spreadsheet | `OutArgument` | [`GDriveRemoteItem`](types/GDriveRemoteItem.md) | The spreadsheet in which the sheet was created. |
| `JobData` | Job Data | `OutArgument` | `JobInformation` | Metadata about the job that triggered this activity. |

## XAML Example

```xml
<gsuite:WaitForSheetCreated
    DisplayName="Wait For Sheet Created"
    Item.InputMode="UrlOrId"
    Item.IdOrUrl="[spreadsheetId]"
    SheetName="[newSheetName]"
    Result="[spreadsheet]"
    JobData="[jobData]" />
```

## Notes

- This is a persistence activity -- the workflow suspends and resumes when the trigger condition is met.
- Only supported with connection service (not legacy authentication).
