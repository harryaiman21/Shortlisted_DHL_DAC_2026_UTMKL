# Read Cell

`UiPath.GSuite.Activities.ReadCellConnections`

Reads a cell from an existing Google Sheets spreadsheet.

**Package:** `UiPath.GSuite.Activities`
**Category:** Google Sheets
**Connector:** `uipath-google-sheets`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | Spreadsheet | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | Yes | | The spreadsheet. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |
| `RangeLocation` | Sheet or Named Range | `InArgument` | `String` | Yes | | The spreadsheet sheet/named range containing the cell. |
| `Cell` | Cell | `InArgument` | `String` | | | The spreadsheet cell location (e.g. `A1`). Hidden when a named range is selected. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `WhatToRead` | What to Read | [`ValuesType`](#enum-reference) | `Values` | What to read (values, formulas, text). |
| `CellValueType` | Cell Value Type | [`CellFormatType`](#enum-reference) | `Text` | The type of value to be read. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `Result` | Result | `OutArgument` | `T` | The cell retrieved data. |

## Enum Reference

**`ValuesType`** (`UiPath.GSuite.Sheets.Enums`): `Values`, `Formulas`, `Text`

**`CellFormatType`** (`UiPath.GSuite.Activities.Enums`): `General`, `DateAndTime`, `Date`, `Time`, `Number`, `Integer`, `Text`

## XAML Example

```xml
<gsuite:ReadCellConnections
    x:TypeArguments="x:Object"
    DisplayName="Read Cell"
    sap2010:WorkflowViewState.IdRef="ReadCellConnections_1"
    Item.InputMode="UrlOrId"
    Item.IdOrUrl="[spreadsheetId]"
    RangeLocation="[&quot;Sheet1&quot;]"
    Cell="[&quot;A1&quot;]"
    WhatToRead="Values"
    CellValueType="Text"
    Result="[cellValue]" />
```

## Notes

- The `ReadCellConnections` class is generic (`ReadCellConnections<T>`). Use `x:TypeArguments` in XAML to specify the output type.
- When `RangeLocation` is set to a named range, the `Cell` field is automatically hidden.
