# Read Row

`UiPath.GSuite.Activities.ReadRowConnections`

Reads a single row from a Google Sheets spreadsheet starting at a specified cell.

**Package:** `UiPath.GSuite.Activities`
**Category:** Google Sheets
**Connector:** `uipath-google-sheets`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | Spreadsheet | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | Yes | | The spreadsheet. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |
| `Range` | Sheet Name | `InArgument` | `String` | Yes | | The name of the sheet containing the row. |
| `StartingCell` | Starting Cell | `InArgument` | `String` | Yes | | The cell address from which to start reading the row (e.g. `A5`). |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `Result` | Result | `OutArgument` | `DataRow` | The row data as a `DataRow`. |

## XAML Example

```xml
<gsuite:ReadRowConnections
    DisplayName="Read Row"
    sap2010:WorkflowViewState.IdRef="ReadRowConnections_1"
    Item.InputMode="UrlOrId"
    Item.IdOrUrl="[spreadsheetId]"
    Range="[&quot;Sheet1&quot;]"
    StartingCell="[&quot;A5&quot;]"
    Result="[rowData]" />
```

## Notes

- The `Range` property in this activity refers to the sheet name, not a cell range.
- The `StartingCell` must be a valid cell reference (e.g. `A1`, `B5`). The activity reads the entire row starting from that cell.
