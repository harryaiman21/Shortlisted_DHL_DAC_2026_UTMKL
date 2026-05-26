# Write Column

`UiPath.GSuite.Activities.WriteColumnConnections`

Writes a single column of data to a Google Sheets spreadsheet.

**Package:** `UiPath.GSuite.Activities`
**Category:** Google Sheets
**Connector:** `uipath-google-sheets`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | Spreadsheet | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | Yes | | The spreadsheet. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |
| `Range` | Range | `InArgument` | `String` | Yes | | The spreadsheet range (e.g. `Sheet1!A1`). |
| `WriteMode` | Write Mode | `InArgument` | [`RangeWriteMode`](#enum-reference) | | `AppendRight` | Indicates how to add the data to the indicated range. |
| `ColumnPosition` | Column Position | `InArgument` | `Int32` | | `0` | The column index position where the activity overwrites/inserts the column. |
| `DataColumn` | Data Column | `InArgument` | `DataColumn` | Conditional | | The data in a `DataColumn` that will be written. Required when `DataType` is `DataColumn`. |
| `ArrayColumn` | Array Column | `InArgument` | `IEnumerable<Object>` | Conditional | | The data in an array that will be written. Required when `DataType` is `ArrayColumn`. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `DataType` | Data Type | [`InputDataType`](#enum-reference) | `DataColumn` | Indicates the type of data that will be written. |

## Enum Reference

**`RangeWriteMode`** (`UiPath.GSuite.Activities.Sheets.Enums`): `Overwrite` (overwrite any previous data), `Append` (append to the bottom), `AppendRight` (append to the right), `Insert` (insert at a chosen row index), `InsertRight` (insert at a chosen column index)

**`InputDataType`** (`UiPath.GSuite.Activities.Sheets.Enums`): `DataRow`, `ArrayRow`, `DataColumn`, `ArrayColumn`, `IndividualFields`

## XAML Example

```xml
<gsuite:WriteColumnConnections
    DisplayName="Write Column"
    sap2010:WorkflowViewState.IdRef="WriteColumnConnections_1"
    Item.InputMode="UrlOrId"
    Item.IdOrUrl="[spreadsheetId]"
    Range="[&quot;Sheet1!A1&quot;]"
    DataType="ArrayColumn"
    ArrayColumn="[columnValues]"
    WriteMode="[RangeWriteMode.Overwrite]" />
```

## Notes

- When `DataType` is `IndividualFields`, the activity uses dynamic properties based on row data discovered at design time.
- The `InputDataType` enum values relevant to this activity are `DataColumn`, `ArrayColumn`, and `IndividualFields`.
