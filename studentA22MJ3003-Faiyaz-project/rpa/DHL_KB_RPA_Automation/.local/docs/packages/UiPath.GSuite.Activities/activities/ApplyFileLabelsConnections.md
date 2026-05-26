# Apply File Labels

`UiPath.GSuite.Activities.ApplyFileLabelsConnections`

Applies Google Drive labels and their field values to a file. Labels can include text, date, number, selection, and user fields.

**Package:** `UiPath.GSuite.Activities`
**Category:** Drive
**Connector:** `uipath-google-drive`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | File | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | Yes | | The file to apply labels to. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |
| `LabelSelectionMode` | Label Selection Mode | `Property` | `ItemSelectionMode` | No | `MultiSelect` | How labels are specified: by multi-select in the designer or by a variable. |
| `SelectedLabels` | Labels | `Property` | `string` | Conditional | | The serialized list of labels selected via the designer. Required when `LabelSelectionMode` is `MultiSelect`. |
| `ManualEntrySelectedLabels` | Labels | `InArgument` | `IEnumerable<object>` | Conditional | | The labels to apply as a variable collection of `GDriveLabel` objects. Required when `LabelSelectionMode` is `Variable`. |
| `State` | State | `Property` | `LabelFieldsActivityState` | No | | Maintains the state of configured dynamic label field properties. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google Workspace connection to use. |

## Enum Reference

### `ItemSelectionMode`
| Value | Description |
|-------|-------------|
| `MultiSelect` | Select labels via the designer multi-select widget |
| `Variable` | Provide labels as a runtime variable |

## XAML Example

```xml
<gsuite:ApplyFileLabelsConnections
    DisplayName="Apply File Labels"
    ConnectionId="[myConnection]"
    LabelSelectionMode="Variable"
    ManualEntrySelectedLabels="[labelList]">
    <gsuite:ApplyFileLabelsConnections.Item>
        <models:DriveItemArgument InputMode="UrlOrId">
            <models:DriveItemArgument.IdOrUrl>
                <InArgument x:TypeArguments="x:String">[fileIdOrUrl]</InArgument>
            </models:DriveItemArgument.IdOrUrl>
        </models:DriveItemArgument>
    </gsuite:ApplyFileLabelsConnections.Item>
</gsuite:ApplyFileLabelsConnections>
```

## Notes

- Requires a Google Workspace connection with Drive and Drive Labels scopes.
- When using `MultiSelect` mode, additional dynamic properties appear in the designer for each label's configurable fields (text, date, selection, user, number).
- Throws a not-found error if the specified file does not exist.
