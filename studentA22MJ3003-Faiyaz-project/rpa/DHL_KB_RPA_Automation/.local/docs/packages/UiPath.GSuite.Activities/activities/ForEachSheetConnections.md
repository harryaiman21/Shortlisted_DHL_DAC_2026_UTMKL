# For Each Sheet

`UiPath.GSuite.Activities.ForEachSheetConnections`

Iterates over a collection of sheets in a Google Sheets spreadsheet, executing the body for each sheet.

**Package:** `UiPath.GSuite.Activities`
**Category:** Google Sheets
**Connector:** `uipath-google-sheets`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | Spreadsheet | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | Yes | | The spreadsheet. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |
| `CurrentItemVariableName` | Current Item Variable Name | `Property` | `String` | Yes | `CurrentItem` | Identifier for the current sheet name in iteration. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `Length` | Length | `OutArgument` | `Int32` | The number of sheets processed. |

## XAML Example

```xml
<gsuite:ForEachSheetConnections
    DisplayName="For Each Sheet"
    sap2010:WorkflowViewState.IdRef="ForEachSheetConnections_1"
    Item.InputMode="UrlOrId"
    Item.IdOrUrl="[spreadsheetId]"
    CurrentItemVariableName="CurrentItem"
    Length="[sheetCount]">
  <ActivityAction x:TypeArguments="x:String, x:Int32">
    <ActivityAction.Argument1>
      <DelegateInArgument x:TypeArguments="x:String" Name="CurrentItem" />
    </ActivityAction.Argument1>
    <ActivityAction.Argument2>
      <DelegateInArgument x:TypeArguments="x:Int32" Name="CurrentItemIndex" />
    </ActivityAction.Argument2>
    <Sequence DisplayName="Do">
      <!-- body activities here -->
    </Sequence>
  </ActivityAction>
</gsuite:ForEachSheetConnections>
```

## Notes

- The body receives two arguments: the current sheet name (`String`) and the current index (`Int32`).
- Sheet names are retrieved via the Google Sheets API at runtime.
