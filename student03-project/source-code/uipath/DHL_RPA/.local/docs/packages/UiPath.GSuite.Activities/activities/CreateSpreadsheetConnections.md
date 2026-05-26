# Create Spreadsheet

`UiPath.GSuite.Activities.CreateSpreadsheetConnections`

Creates a new Google Sheets spreadsheet in Google Drive under a specified parent folder.

**Package:** `UiPath.GSuite.Activities`
**Category:** Drive
**Connector:** `uipath-google-drive`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | Parent Folder | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | No | | The parent folder where the spreadsheet is created. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |
| `SpreadsheetName` | Spreadsheet Name | `InArgument` | `string` | No | `Untitled spreadsheet` | The name of the new spreadsheet. |
| `FirstSheetName` | First Sheet Name | `InArgument` | `string` | No | `Sheet1` | The name of the first sheet in the spreadsheet. |
| `ConflictResolution` | Conflict Resolution | `InArgument` | `ConflictBehavior` | No | `Fail` | Behavior when a spreadsheet with the same name already exists. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google Workspace connection to use. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `NewSpreadsheet` | New Spreadsheet | `OutArgument` | [`GDriveRemoteItem`](types/GDriveRemoteItem.md) | The newly created spreadsheet. |

## Output Model

Returns a [`GDriveRemoteItem`](types/GDriveRemoteItem.md) with file/folder ID, name, URL, MIME type, dates, and size.

## Enum Reference

### `ConflictBehavior`
| Value | Description |
|-------|-------------|
| `Replace` | Replace the existing item |
| `Fail` | Fail the request if another item with the same name exists |
| `Rename` | Rename the new item to have a unique name |
| `AddSeparate` | Add without renaming, even if same name exists |
| `UseExisting` | Return the existing item |

## XAML Example

```xml
<gsuite:CreateSpreadsheetConnections
    DisplayName="Create Spreadsheet"
    ConnectionId="[myConnection]"
    SpreadsheetName="[&quot;My Report&quot;]"
    FirstSheetName="[&quot;Data&quot;]"
    ConflictResolution="[ConflictBehavior.Fail]"
    NewSpreadsheet="[newSpreadsheet]">
    <gsuite:CreateSpreadsheetConnections.Item>
        <models:DriveItemArgument InputMode="UrlOrId">
            <models:DriveItemArgument.IdOrUrl>
                <InArgument x:TypeArguments="x:String">[parentFolderId]</InArgument>
            </models:DriveItemArgument.IdOrUrl>
        </models:DriveItemArgument>
    </gsuite:CreateSpreadsheetConnections.Item>
</gsuite:CreateSpreadsheetConnections>
```

## Notes

- Requires a Google Workspace connection with Drive and Sheets scopes.
