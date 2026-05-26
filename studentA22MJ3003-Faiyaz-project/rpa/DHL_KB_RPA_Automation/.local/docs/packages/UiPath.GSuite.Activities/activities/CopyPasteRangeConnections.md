# Copy/Paste Range

`UiPath.GSuite.Activities.CopyPasteRangeConnections`

Copies a range of cells and pastes it to a destination in the same or a different sheet within the same spreadsheet.

**Package:** `UiPath.GSuite.Activities`
**Category:** Google Sheets
**Connector:** `uipath-google-sheets`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | Spreadsheet | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | Yes | | The spreadsheet. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |
| `SourceSheetName` | Source Sheet Name | `InArgument` | `String` | Yes | | The name of the sheet containing the source range. |
| `SourceRange` | Source Range | `InArgument` | `String` | Yes | `A1:B2` | The range to copy (e.g. `A1:D10`). |
| `DestinationSheetName` | Destination Sheet Name | `InArgument` | `String` | | | The name of the destination sheet. Defaults to the source sheet if empty. |
| `DestinationStartingCell` | Destination Starting Cell | `InArgument` | `String` | Yes | `C3` | The starting cell where to paste the information (e.g. `C3`). Must be a valid single cell reference. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `PasteType` | Paste Type | [`PasteType`](#enum-reference) | `PASTE_NORMAL` | The type of the paste operation. |
| `PasteOrientation` | Paste Orientation | [`PasteOrientation`](#enum-reference) | `NORMAL` | The paste orientation. |

## Enum Reference

**`PasteType`** (`UiPath.GSuite.Activities.Enums`): `PASTE_NORMAL` (values, formulas, formats, and merges), `PASTE_VALUES` (values only), `PASTE_FORMAT` (format and data validation only), `PASTE_NO_BORDERS` (like normal but without borders), `PASTE_FORMULA` (formulas only), `PASTE_DATA_VALIDATION` (data validation only), `PASTE_CONDITIONAL_FORMATTING` (conditional formatting rules only)

**`PasteOrientation`** (`UiPath.GSuite.Activities.Enums`): `NORMAL` (paste normally), `TRANSPOSE` (rows become columns and vice versa)

## XAML Example

```xml
<gsuite:CopyPasteRangeConnections
    DisplayName="Copy/Paste Range"
    sap2010:WorkflowViewState.IdRef="CopyPasteRangeConnections_1"
    Item.InputMode="UrlOrId"
    Item.IdOrUrl="[spreadsheetId]"
    SourceSheetName="[&quot;Sheet1&quot;]"
    SourceRange="[&quot;A1:D10&quot;]"
    DestinationSheetName="[&quot;Sheet2&quot;]"
    DestinationStartingCell="[&quot;A1&quot;]"
    PasteType="PASTE_VALUES"
    PasteOrientation="NORMAL" />
```

## Notes

- If `DestinationSheetName` is not provided, the paste destination defaults to the same sheet as the source.
- The `DestinationStartingCell` must be a valid single cell reference.
