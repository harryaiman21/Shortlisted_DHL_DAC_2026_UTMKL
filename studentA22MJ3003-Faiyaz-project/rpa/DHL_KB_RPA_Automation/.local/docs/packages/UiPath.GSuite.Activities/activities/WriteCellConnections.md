# Write Cell

`UiPath.GSuite.Activities.WriteCellConnections`

Writes a value to a Google Sheets cell.

**Package:** `UiPath.GSuite.Activities`
**Category:** Google Sheets
**Connector:** `uipath-google-sheets`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | Spreadsheet | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | Yes | | The spreadsheet. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |
| `RangeLocation` | Sheet or Named Range | `InArgument` | `String` | Yes | | The spreadsheet sheet/named range containing the target cell. |
| `Cell` | Cell | `InArgument` | `String` | | | The spreadsheet cell location (e.g. `A1`). Hidden when a named range is selected. |
| `WhatToWrite` | Value | `InArgument` | `Object` | Yes | | The value that will be written in the spreadsheet. |

## XAML Example

```xml
<gsuite:WriteCellConnections
    DisplayName="Write Cell"
    sap2010:WorkflowViewState.IdRef="WriteCellConnections_1"
    Item.InputMode="UrlOrId"
    Item.IdOrUrl="[spreadsheetId]"
    RangeLocation="[&quot;Sheet1&quot;]"
    Cell="[&quot;A1&quot;]"
    WhatToWrite="[&quot;Hello World&quot;]" />
```

## Notes

- When `RangeLocation` is set to a named range, the `Cell` field is automatically hidden.
- Write operations support batching when used inside a `ForEachRow` loop.
