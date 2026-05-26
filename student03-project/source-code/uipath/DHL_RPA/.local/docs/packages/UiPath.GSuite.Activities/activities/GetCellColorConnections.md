# Get Cell Color

`UiPath.GSuite.Activities.GetCellColorConnections`

Gets the background color of a Google Sheets cell.

**Package:** `UiPath.GSuite.Activities`
**Category:** Google Sheets
**Connector:** `uipath-google-sheets`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | Spreadsheet | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | Yes | | The spreadsheet. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |
| `Range` | Sheet Name | `InArgument` | `String` | Yes | | The name of the sheet containing the cell. |
| `Cell` | Cell | `InArgument` | `String` | Yes | | The cell address to read the color from (e.g. `A1`). |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `HexColor` | Hex Color | `OutArgument` | `String` | The result as a hex color string (e.g. `#FF5733`). |
| `Color` | Color | `OutArgument` | `Color` | The result as a `System.Drawing.Color` object. |

## XAML Example

```xml
<gsuite:GetCellColorConnections
    DisplayName="Get Cell Color"
    sap2010:WorkflowViewState.IdRef="GetCellColorConnections_1"
    Item.InputMode="UrlOrId"
    Item.IdOrUrl="[spreadsheetId]"
    Range="[&quot;Sheet1&quot;]"
    Cell="[&quot;A1&quot;]"
    Color="[cellColor]"
    HexColor="[cellHexColor]" />
```

## Notes

- The `Range` property in this activity refers to the sheet name, not a cell range.
- Both `Color` and `HexColor` outputs are always populated.
