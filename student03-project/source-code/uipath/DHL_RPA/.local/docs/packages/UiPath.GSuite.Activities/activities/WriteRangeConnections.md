# Write Range

`UiPath.GSuite.Activities.WriteRangeConnections`

Writes a `DataTable` to a range in a Google Sheets spreadsheet.

**Package:** `UiPath.GSuite.Activities`
**Category:** Google Sheets
**Connector:** `uipath-google-sheets`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | Spreadsheet | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | Yes | | The spreadsheet. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |
| `Range` | Range | `InArgument` | `String` | Yes | | The spreadsheet range (e.g. `Sheet1!A1`). |
| `Source` | Data | `InArgument` | `DataTable` | Yes | | The `DataTable` that will be written in the spreadsheet. |
| `IncludeHeaders` | Include Headers | `InArgument` | `Boolean` | | `true` | If checked, the `DataTable` headers are also inserted into the spreadsheet. |
| `WriteMode` | Write Mode | `InArgument` | [`RangeWriteMode`](#enum-reference) | | `Overwrite` | Indicates how to add the `DataTable` to the indicated range. |
| `RowPosition` | Row Position | `InArgument` | `Int32` | | `0` | The row index position where the activity inserts rows. Used when `WriteMode` is `Insert`. |

## Enum Reference

**`RangeWriteMode`** (`UiPath.GSuite.Activities.Sheets.Enums`): `Overwrite` (overwrite any previous data), `Append` (append to the bottom), `AppendRight` (append to the right), `Insert` (insert at a chosen row index), `InsertRight` (insert at a chosen column index)

## XAML Example

```xml
<gsuite:WriteRangeConnections
    DisplayName="Write Range"
    sap2010:WorkflowViewState.IdRef="WriteRangeConnections_1"
    Item.InputMode="UrlOrId"
    Item.IdOrUrl="[spreadsheetId]"
    Range="[&quot;Sheet1!A1&quot;]"
    Source="[dataTable]"
    IncludeHeaders="True"
    WriteMode="[RangeWriteMode.Overwrite]" />
```

## Notes

- The `Range` property uses the combined format `SheetName!RangeAddress`.
- `Overwrite` replaces existing content. `Append` adds rows below. `AppendRight` adds columns to the right.
- `Insert` inserts rows at the specified `RowPosition`. `InsertRight` inserts columns at the specified position.
