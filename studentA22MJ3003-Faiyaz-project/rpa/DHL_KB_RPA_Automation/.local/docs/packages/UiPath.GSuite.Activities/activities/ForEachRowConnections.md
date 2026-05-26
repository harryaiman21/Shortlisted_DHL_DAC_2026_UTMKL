# For Each Row

`UiPath.GSuite.Activities.ForEachRowConnections`

Iterates over a collection of data rows in a Google Sheets range, executing the body for each row.

**Package:** `UiPath.GSuite.Activities`
**Category:** Google Sheets
**Connector:** `uipath-google-sheets`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | Spreadsheet | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | Yes | | The spreadsheet. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |
| `Range` | Range | `InArgument` | `String` | Yes | | The spreadsheet range (e.g. `Sheet1!A1:E100`). |
| `HasHeaders` | Has Headers | `InArgument` | `Boolean` | | `true` | Whether the range has headers. |
| `EmptyRowAction` | Empty Row Action | `InArgument` | [`RowIteratorAction`](#enum-reference) | | `Skip` | The action to take if an empty row is found. |
| `CurrentItemVariableName` | Current Item Variable Name | `Property` | `String` | Yes | `CurrentRow` | Identifier for the current `DataRow` in iteration. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ReadAs` | Read As | [`ValuesType`](#enum-reference) | `Values` | The type of the values to read. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `Length` | Length | `OutArgument` | `Int32` | The number of rows processed. |

## Enum Reference

**`RowIteratorAction`** (`UiPath.GSuite.Activities.Sheets.Enums`): `Skip` (skip the empty row), `Process` (process the empty row), `Stop` (stop iteration)

**`ValuesType`** (`UiPath.GSuite.Sheets.Enums`): `Values`, `Formulas`, `Text`

## XAML Example

```xml
<gsuite:ForEachRowConnections
    x:TypeArguments="sd:DataRow"
    DisplayName="For Each Row"
    sap2010:WorkflowViewState.IdRef="ForEachRowConnections_1"
    Item.InputMode="UrlOrId"
    Item.IdOrUrl="[spreadsheetId]"
    Range="[&quot;Sheet1!A1:E100&quot;]"
    HasHeaders="True"
    EmptyRowAction="[RowIteratorAction.Skip]"
    ReadAs="[ValuesType.Values]"
    Length="[rowCount]">
  <ActivityAction x:TypeArguments="sd:DataRow, x:Int32">
    <ActivityAction.Argument1>
      <DelegateInArgument x:TypeArguments="sd:DataRow" Name="CurrentRow" />
    </ActivityAction.Argument1>
    <ActivityAction.Argument2>
      <DelegateInArgument x:TypeArguments="x:Int32" Name="CurrentRowIndex" />
    </ActivityAction.Argument2>
    <Sequence DisplayName="Do">
      <!-- body activities here -->
    </Sequence>
  </ActivityAction>
</gsuite:ForEachRowConnections>
```

## Notes

- The `ForEachRowConnections` class is generic (`ForEachRowConnections<T>` where `T : DataRow`). Use `x:TypeArguments` in XAML.
- The body receives two arguments: the current `DataRow` and the current row index (`Int32`).
- Column names are validated at design time when `HasHeaders` is `true`.
- The `Range` property uses the combined format `SheetName!RangeAddress`.
