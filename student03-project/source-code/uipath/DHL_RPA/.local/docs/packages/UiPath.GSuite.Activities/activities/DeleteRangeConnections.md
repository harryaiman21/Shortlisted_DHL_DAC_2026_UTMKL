# Delete Range

`UiPath.GSuite.Activities.DeleteRangeConnections`

Deletes a range from an existing Google Sheets spreadsheet, optionally shifting remaining cells.

**Package:** `UiPath.GSuite.Activities`
**Category:** Google Sheets
**Connector:** `uipath-google-sheets`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | Spreadsheet | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | Yes | | The spreadsheet. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |
| `Range` | Range | `InArgument` | `String` | Yes | | The spreadsheet range to be deleted (e.g. `Sheet1!A1:C5`). |
| `DeleteMode` | Delete Mode | `InArgument` | [`RangeDeleteMode`](#enum-reference) | | `None` | Indicates how to delete ranges. |

## Enum Reference

**`RangeDeleteMode`** (`UiPath.GSuite.Activities.Sheets.Enums`): `None` (clear range values such as format, fill, and border), `Rows` (shift cells up), `Columns` (shift cells left)

## XAML Example

```xml
<gsuite:DeleteRangeConnections
    DisplayName="Delete Range"
    sap2010:WorkflowViewState.IdRef="DeleteRangeConnections_1"
    Item.InputMode="UrlOrId"
    Item.IdOrUrl="[spreadsheetId]"
    Range="[&quot;Sheet1!B2:D5&quot;]"
    DeleteMode="[RangeDeleteMode.Rows]" />
```

## Notes

- `None` mode clears the range content without shifting cells.
- `Rows` mode shifts remaining cells upward after deletion.
- `Columns` mode shifts remaining cells leftward after deletion.
