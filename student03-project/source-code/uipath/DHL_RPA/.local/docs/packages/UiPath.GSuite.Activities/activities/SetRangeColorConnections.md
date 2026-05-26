# Set Range Color

`UiPath.GSuite.Activities.SetRangeColorConnections`

Sets the background color of a Google Sheets range.

**Package:** `UiPath.GSuite.Activities`
**Category:** Google Sheets
**Connector:** `uipath-google-sheets`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | Spreadsheet | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | Yes | | The spreadsheet. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |
| `Range` | Range | `InArgument` | `String` | Yes | | The range to color (e.g. `Sheet1!A1:D10`). |
| `HexColor` | Hex Color | `InArgument` | `String` | Conditional | | The color as a hex string (e.g. `#FF5733`). Used when `ColorSelectionMode` is `HexColor`. |
| `Color` | Color | `InArgument` | `Color` | Conditional | | The color as a `System.Drawing.Color` value. Used when `ColorSelectionMode` is `Color`. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ColorSelectionMode` | Color Selection Mode | [`ColorInputMode`](#enum-reference) | `Color` | Whether to specify color as a `Color` object or a hex string. |

## Enum Reference

**`ColorInputMode`** (`UiPath.GSuite.Activities.Sheets.Enums`): `Color` (use an existing `System.Drawing.Color` object), `HexColor` (use a hex formatted color string)

## XAML Example

```xml
<gsuite:SetRangeColorConnections
    DisplayName="Set Range Color"
    sap2010:WorkflowViewState.IdRef="SetRangeColorConnections_1"
    Item.InputMode="UrlOrId"
    Item.IdOrUrl="[spreadsheetId]"
    Range="[&quot;Sheet1!A1:D1&quot;]"
    ColorSelectionMode="HexColor"
    HexColor="[&quot;#4CAF50&quot;]" />
```

## Notes

- Either `Color` or `HexColor` must be provided, depending on the `ColorSelectionMode`.
- The `Range` property uses the combined format `SheetName!RangeAddress`.
