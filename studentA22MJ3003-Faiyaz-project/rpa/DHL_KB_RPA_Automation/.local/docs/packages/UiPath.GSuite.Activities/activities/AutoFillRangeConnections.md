# Auto Fill Range

`UiPath.GSuite.Activities.AutoFillRangeConnections`

Automatically completes a series based on a range in a Google Sheets spreadsheet.

**Package:** `UiPath.GSuite.Activities`
**Category:** Google Sheets
**Connector:** `uipath-google-sheets`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | Spreadsheet | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | Yes | | The spreadsheet. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |
| `Range` | Sheet Name | `InArgument` | `String` | Yes | | The name of the sheet containing the rule range. |
| `RuleRange` | Rule Range | `InArgument` | `String` | Yes | `A1:B2` | The formula/pattern range to use as the auto-fill source (e.g. `A1:A3`). |
| `FillLength` | Fill Length | `InArgument` | `Int32` | | | The number of cells to fill in the specified direction. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `Direction` | Direction | [`Direction`](#enum-reference) | `DOWN` | The direction in which to auto-fill. |

## Enum Reference

**`Direction`** (`UiPath.GSuite.Activities.Enums`): `UP`, `DOWN`, `LEFT`, `RIGHT`

## XAML Example

```xml
<gsuite:AutoFillRangeConnections
    DisplayName="Auto Fill Range"
    sap2010:WorkflowViewState.IdRef="AutoFillRangeConnections_1"
    Item.InputMode="UrlOrId"
    Item.IdOrUrl="[spreadsheetId]"
    Range="[&quot;Sheet1&quot;]"
    RuleRange="[&quot;A1:A3&quot;]"
    FillLength="[10]"
    Direction="DOWN" />
```

## Notes

- The `Range` property in this activity refers to the sheet name, not a cell range. The `RuleRange` specifies the actual cell range.
- The rule range defines the pattern (e.g. a sequence 1, 2, 3) which is then extended by `FillLength` cells in the specified `Direction`.
