# Rename Sheet

`UiPath.GSuite.Activities.RenameSheetConnections`

Renames a sheet in an existing Google Sheets spreadsheet.

**Package:** `UiPath.GSuite.Activities`
**Category:** Google Sheets
**Connector:** `uipath-google-sheets`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | Spreadsheet | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | Yes | | The spreadsheet. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |
| `SheetName` | Sheet Name | `InArgument` | `String` | Yes | | The current name of the sheet to rename. |
| `NewSheetName` | New Sheet Name | `InArgument` | `String` | Yes | | The new name for the sheet. |

## XAML Example

```xml
<gsuite:RenameSheetConnections
    DisplayName="Rename Sheet"
    sap2010:WorkflowViewState.IdRef="RenameSheetConnections_1"
    Item.InputMode="UrlOrId"
    Item.IdOrUrl="[spreadsheetId]"
    SheetName="[&quot;Sheet1&quot;]"
    NewSheetName="[&quot;CustomerData&quot;]" />
```

## Notes

- Both `SheetName` and `NewSheetName` are required. The activity will fail if either is empty.
- The new name must not conflict with an existing sheet name in the spreadsheet.
