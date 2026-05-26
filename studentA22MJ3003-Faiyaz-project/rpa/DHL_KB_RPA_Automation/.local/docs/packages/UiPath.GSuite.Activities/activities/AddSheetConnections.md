# Add Sheet

`UiPath.GSuite.Activities.AddSheetConnections`

Adds a new sheet to an existing Google Sheets spreadsheet.

**Package:** `UiPath.GSuite.Activities`
**Category:** Google Sheets
**Connector:** `uipath-google-sheets`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | Spreadsheet | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | Yes | | The spreadsheet to add a sheet to. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |
| `SheetName` | Sheet Name | `InArgument` | `String` | | | The name of the new sheet. If left blank, Google Sheets determines the name. |
| `PositionIndex` | Position Index | `InArgument` | `Int32` | | | The position of the new sheet within existing sheets. If empty, appended at the end. First sheet is index 0. |
| `RowCount` | Row Count | `InArgument` | `Int32` | | | The number of rows. Default is 1000. |
| `ColumnCount` | Column Count | `InArgument` | `Int32` | | | The number of columns. Default is 26 (A-Z). |
| `ConflictResolution` | Conflict Resolution | `InArgument` | [`ConflictBehavior`](#enum-reference) | | `Fail` | Conflict resolution when a sheet with the same name exists. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `NewSheetName` | New Sheet Name | `OutArgument` | `String` | The name of the created sheet. |

## Enum Reference

**`ConflictBehavior`** (`UiPath.GSuite.Activities.Drive.Enums`): `Replace` (replace existing), `Fail` (fail if exists)

## XAML Example

```xml
<gsuite:AddSheetConnections
    DisplayName="Add Sheet"
    sap2010:WorkflowViewState.IdRef="AddSheetConnections_1"
    Item.InputMode="UrlOrId"
    Item.IdOrUrl="[spreadsheetId]"
    SheetName="[&quot;NewSheet&quot;]"
    PositionIndex="[0]"
    RowCount="[1000]"
    ColumnCount="[26]"
    ConflictResolution="[ConflictBehavior.Fail]"
    NewSheetName="[createdSheetName]" />
```

## Notes

- `PositionIndex` must be non-negative.
- `RowCount` and `ColumnCount` must be positive when specified.
