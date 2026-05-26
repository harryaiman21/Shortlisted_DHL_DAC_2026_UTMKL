# Read Range

`UiPath.GSuite.Activities.ReadRangeConnections`

Reads a range from a Google Sheets spreadsheet into a `DataTable`.

**Package:** `UiPath.GSuite.Activities`
**Category:** Google Sheets
**Connector:** `uipath-google-sheets`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | Spreadsheet | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | Yes | | The spreadsheet. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |
| `Range` | Range | `InArgument` | `String` | Yes | | The spreadsheet range (e.g. `Sheet1!A1:D10`). |
| `HasHeaders` | Has Headers | `InArgument` | `Boolean` | | `true` | Whether the first row of the range contains column headers. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ReadAs` | Read As | [`ValuesType`](#enum-reference) | `Values` | The type of the values to read. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `Result` | Result | `OutArgument` | `DataTable` | The result as a `DataTable`. |
| `RangeInformation` | Range Information | `OutArgument` | `RangeInformation` | The detailed range information. |

## Enum Reference

**`ValuesType`** (`UiPath.GSuite.Sheets.Enums`): `Values`, `Formulas`, `Text`

## XAML Example

```xml
<gsuite:ReadRangeConnections
    x:TypeArguments="sd:DataTable"
    DisplayName="Read Range"
    sap2010:WorkflowViewState.IdRef="ReadRangeConnections_1"
    Item.InputMode="UrlOrId"
    Item.IdOrUrl="[spreadsheetId]"
    Range="[&quot;Sheet1!A1:D10&quot;]"
    HasHeaders="True"
    ReadAs="[ValuesType.Values]"
    Result="[dataTable]"
    RangeInformation="[rangeInfo]" />
```

## Notes

- The `ReadRangeConnections` class is generic (`ReadRangeConnections<T>` where `T : DataTable`). Use `x:TypeArguments` to specify the output type.
- The `Range` property uses the combined format `SheetName!RangeAddress` (e.g. `Sheet1!A1:D10`).
- Column names are validated at design time when `HasHeaders` is `true`.
