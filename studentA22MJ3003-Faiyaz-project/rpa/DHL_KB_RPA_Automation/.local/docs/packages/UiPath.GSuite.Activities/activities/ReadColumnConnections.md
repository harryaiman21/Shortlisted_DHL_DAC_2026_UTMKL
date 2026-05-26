# Read Column

`UiPath.GSuite.Activities.ReadColumnConnections`

Reads a single column from a Google Sheets spreadsheet starting at a specified cell.

**Package:** `UiPath.GSuite.Activities`
**Category:** Google Sheets
**Connector:** `uipath-google-sheets`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | Spreadsheet | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | Yes | | The spreadsheet. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |
| `Range` | Sheet Name | `InArgument` | `String` | Yes | | The name of the sheet containing the column. |
| `StartingCell` | Starting Cell | `InArgument` | `String` | Yes | | The cell address from which to start reading the column (e.g. `A1`). |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `Result` | Result | `OutArgument` | `Object[]` | The column values as an array. |

## XAML Example

```xml
<gsuite:ReadColumnConnections
    DisplayName="Read Column"
    sap2010:WorkflowViewState.IdRef="ReadColumnConnections_1"
    Item.InputMode="UrlOrId"
    Item.IdOrUrl="[spreadsheetId]"
    Range="[&quot;Sheet1&quot;]"
    StartingCell="[&quot;A1&quot;]"
    Result="[columnData]" />
```

## Notes

- The `Range` property in this activity refers to the sheet name, not a cell range.
- The `StartingCell` must be a valid cell reference (e.g. `A1`, `C3`). The activity reads the entire column starting from that cell.
