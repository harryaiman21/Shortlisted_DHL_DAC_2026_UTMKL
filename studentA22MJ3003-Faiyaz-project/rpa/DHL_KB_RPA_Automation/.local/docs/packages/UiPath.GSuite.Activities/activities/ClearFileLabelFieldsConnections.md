# Clear File Label Fields

`UiPath.GSuite.Activities.ClearFileLabelFieldsConnections`

Clears the values of specific fields on Google Drive labels applied to a file.

**Package:** `UiPath.GSuite.Activities`
**Category:** Drive
**Connector:** `uipath-google-drive`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | File | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | Yes | | The file whose label fields to clear. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |
| `LabelSelectionMode` | Label Selection Mode | `Property` | `ItemSelectionMode` | No | `MultiSelect` | How labels are specified: by multi-select in the designer or by a variable. |
| `SelectedLabels` | Labels | `Property` | `string` | Conditional | | The serialized list of labels selected via the designer. Required when `LabelSelectionMode` is `MultiSelect`. |
| `ManualEntrySelectedLabels` | Labels | `InArgument` | `IEnumerable<object>` | Conditional | | The labels as a variable collection of `GDriveLabel` objects. Required when `LabelSelectionMode` is `Variable`. |
| `FieldSelectionMode` | Field Selection Mode | `Property` | `ItemSelectionMode` | No | `MultiSelect` | How label fields are specified: by multi-select in the designer or by a variable. |
| `SelectedFields` | Fields | `Property` | `string` | Conditional | | The serialized list of label fields selected via the designer. Required when `FieldSelectionMode` is `MultiSelect`. |
| `ManualEntrySelectedFields` | Fields | `InArgument` | `IEnumerable<GDriveLabelField>` | Conditional | | The label fields to clear as a variable collection. Required when `FieldSelectionMode` is `Variable`. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google Workspace connection to use. |

## Enum Reference

### `ItemSelectionMode`
| Value | Description |
|-------|-------------|
| `MultiSelect` | Select via the designer multi-select widget |
| `Variable` | Provide as a runtime variable |

## XAML Example

```xml
<gsuite:ClearFileLabelFieldsConnections
    DisplayName="Clear File Label Fields"
    ConnectionId="[myConnection]"
    LabelSelectionMode="Variable"
    ManualEntrySelectedLabels="[selectedLabels]"
    FieldSelectionMode="Variable"
    ManualEntrySelectedFields="[fieldsToClean]">
    <gsuite:ClearFileLabelFieldsConnections.Item>
        <models:DriveItemArgument InputMode="UrlOrId">
            <models:DriveItemArgument.IdOrUrl>
                <InArgument x:TypeArguments="x:String">[fileIdOrUrl]</InArgument>
            </models:DriveItemArgument.IdOrUrl>
        </models:DriveItemArgument>
    </gsuite:ClearFileLabelFieldsConnections.Item>
</gsuite:ClearFileLabelFieldsConnections>
```

## Notes

- Requires a Google Workspace connection with Drive and Drive Labels scopes.
- This activity clears field values (sets them to empty) rather than removing the label itself.
