# Write Row

`UiPath.GSuite.Activities.WriteRowConnections`

Writes a single row of data to a Google Sheets spreadsheet.

**Package:** `UiPath.GSuite.Activities`
**Category:** Google Sheets
**Connector:** `uipath-google-sheets`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | Spreadsheet | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | Yes | | The spreadsheet. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |
| `Range` | Range | `InArgument` | `String` | Yes | | The spreadsheet range (e.g. `Sheet1!A1`). |
| `WriteMode` | Write Mode | `InArgument` | [`RangeWriteMode`](#enum-reference) | | `Append` | Indicates how to add the data to the indicated range. |
| `RowPosition` | Row Position | `InArgument` | `Int32` | | `0` | The row index position where the activity overwrites/inserts the row. |
| `DataRow` | Data Row | `InArgument` | `DataRow` | Conditional | | The data in a `DataRow` that will be written. Required when `DataType` is `DataRow`. |
| `ArrayRow` | Array Row | `InArgument` | `IEnumerable<Object>` | Conditional | | The data in an array that will be written. Required when `DataType` is `ArrayRow`. |
| `HasHeaders` | Has Headers | `InArgument` | `Boolean` | | `false` | Whether the range has headers (offsets the row position by 1 when true). |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `DataType` | Data Type | [`InputDataType`](#enum-reference) | `DataRow` | Indicates the type of data that will be written. |

## Enum Reference

**`RangeWriteMode`** (`UiPath.GSuite.Activities.Sheets.Enums`): `Overwrite` (overwrite any previous data), `Append` (append to the bottom), `AppendRight` (append to the right), `Insert` (insert at a chosen row index), `InsertRight` (insert at a chosen column index)

**`InputDataType`** (`UiPath.GSuite.Activities.Sheets.Enums`): `DataRow`, `ArrayRow`, `DataColumn`, `ArrayColumn`, `IndividualFields`

## XAML Example

```xml
<gsuite:WriteRowConnections
    DisplayName="Write Row"
    sap2010:WorkflowViewState.IdRef="WriteRowConnections_1"
    Item.InputMode="UrlOrId"
    Item.IdOrUrl="[spreadsheetId]"
    Range="[&quot;Sheet1!A1&quot;]"
    DataType="DataRow"
    DataRow="[myDataRow]"
    WriteMode="[RangeWriteMode.Append]" />
```

## Notes

- When `DataType` is `IndividualFields`, the activity uses dynamic properties based on column headers discovered at design time.
- Write operations support batching when used inside a `ForEachRow` loop.
- When `HasHeaders` is `true`, the `RowPosition` is offset by 1 to account for the header row.
