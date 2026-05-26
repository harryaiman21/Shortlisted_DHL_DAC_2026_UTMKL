# Delete Column

`UiPath.GSuite.Activities.DeleteColumnConnections`

Deletes a column from an existing Google Sheets spreadsheet range.

**Package:** `UiPath.GSuite.Activities`
**Category:** Google Sheets
**Connector:** `uipath-google-sheets`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | Spreadsheet | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | Yes | | The spreadsheet. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |
| `Range` | Range | `InArgument` | `String` | Yes | | Indicates the range where to delete the column (e.g. `Sheet1!A1:E100`). |
| `HasHeaders` | Has Headers | `InArgument` | `Boolean` | | `true` | When true, you can specify the column by its header name. |
| `Column` | Column | `InArgument` | `String` | Yes | | The column name or column position to be deleted (e.g. `B` or `CustomerName`). |
| `DeleteMode` | Delete Mode | `InArgument` | [`ColumnDeleteMode`](#enum-reference) | | `Delete` | Indicates the delete behaviour of the selected column. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `RangeInformation` | Range Information | `OutArgument` | `RangeInformation` | The updated range information after the column is deleted. |

## Enum Reference

**`ColumnDeleteMode`** (`UiPath.GSuite.Activities.Sheets.Enums`): `Clear` (clear column values only), `Delete` (delete the entire column)

## XAML Example

```xml
<gsuite:DeleteColumnConnections
    DisplayName="Delete Column"
    sap2010:WorkflowViewState.IdRef="DeleteColumnConnections_1"
    Item.InputMode="UrlOrId"
    Item.IdOrUrl="[spreadsheetId]"
    Range="[&quot;Sheet1!A1:E100&quot;]"
    HasHeaders="True"
    Column="[&quot;B&quot;]"
    DeleteMode="[ColumnDeleteMode.Delete]"
    RangeInformation="[rangeInfo]" />
```

## Notes

- When `HasHeaders` is `true`, you can specify the column by its header name instead of the column letter.
- `Clear` mode clears the column values without removing the column. `Delete` mode removes the entire column.
