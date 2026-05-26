# Delete Sheet

`UiPath.GSuite.Activities.DeleteSheetConnections`

Deletes a sheet from an existing Google Sheets spreadsheet.

**Package:** `UiPath.GSuite.Activities`
**Category:** Google Sheets
**Connector:** `uipath-google-sheets`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | Spreadsheet | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | Yes | | The spreadsheet. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |
| `SheetName` | Sheet Name | `InArgument` | `String` | Yes | | The name of the sheet to delete. |

## XAML Example

```xml
<gsuite:DeleteSheetConnections
    DisplayName="Delete Sheet"
    sap2010:WorkflowViewState.IdRef="DeleteSheetConnections_1"
    Item.InputMode="UrlOrId"
    Item.IdOrUrl="[spreadsheetId]"
    SheetName="[&quot;OldSheet&quot;]" />
```

## Notes

- A spreadsheet must contain at least one sheet. Attempting to delete the last remaining sheet will result in an error.
