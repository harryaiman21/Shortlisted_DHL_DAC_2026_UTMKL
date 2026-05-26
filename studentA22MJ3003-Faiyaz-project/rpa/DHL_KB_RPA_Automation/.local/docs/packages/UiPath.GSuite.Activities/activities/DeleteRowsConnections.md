# Delete Rows

`UiPath.GSuite.Activities.DeleteRowsConnections`

Deletes specified rows from a Google Sheets spreadsheet.

**Package:** `UiPath.GSuite.Activities`
**Category:** Google Sheets
**Connector:** `uipath-google-sheets`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | Spreadsheet | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | Yes | | The spreadsheet. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |
| `Range` | Range | `InArgument` | `String` | Yes | | The spreadsheet range context for row deletion (e.g. `Sheet1!A1:E100`). |
| `Rows` | Rows | `InArgument` | `String` | Yes | | The row index position or ranges to delete (e.g. `2`, `2:5`, `1,3,5`). |
| `DeleteMode` | Delete Mode | `InArgument` | [`RowsDeleteMode`](#enum-reference) | | `Clear` | Indicates how to delete ranges. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `RangeInformation` | Range Information | `OutArgument` | `RangeInformation` | The detailed range information after deletion. |

## Enum Reference

**`RowsDeleteMode`** (`UiPath.GSuite.Activities.Sheets.Enums`): `Clear` (clear range values such as format, fill, and border), `Delete` (delete rows and shift remaining rows up)

## XAML Example

```xml
<gsuite:DeleteRowsConnections
    DisplayName="Delete Rows"
    sap2010:WorkflowViewState.IdRef="DeleteRowsConnections_1"
    Item.InputMode="UrlOrId"
    Item.IdOrUrl="[spreadsheetId]"
    Range="[&quot;Sheet1!A1:E100&quot;]"
    Rows="[&quot;3:5&quot;]"
    DeleteMode="[RowsDeleteMode.Delete]"
    RangeInformation="[rangeInfo]" />
```

## Notes

- This activity integrates with the `ForEachRow` loop: when used inside a `ForEachRow` iteration, deleted rows are tracked so the iterator correctly skips them.
- `Clear` mode clears the row content without removing the row. `Delete` mode removes the rows entirely and shifts remaining rows up.
