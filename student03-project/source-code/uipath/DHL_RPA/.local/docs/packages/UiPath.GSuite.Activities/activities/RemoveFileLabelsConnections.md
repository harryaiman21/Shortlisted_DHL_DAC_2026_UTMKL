# Remove File Labels

`UiPath.GSuite.Activities.RemoveFileLabelsConnections`

Removes one or more Google Drive labels from a file.

**Package:** `UiPath.GSuite.Activities`
**Category:** Drive
**Connector:** `uipath-google-drive`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | File | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | Yes | | The file to remove labels from. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |
| `LabelSelectionMode` | Label Selection Mode | `Property` | `ItemSelectionMode` | No | `MultiSelect` | How labels are specified: by multi-select in the designer or by a variable. |
| `SelectedLabels` | Labels | `Property` | `string` | Conditional | | The serialized list of labels selected via the designer. Required when `LabelSelectionMode` is `MultiSelect`. |
| `ManualEntrySelectedLabels` | Labels | `InArgument` | `IEnumerable<object>` | Conditional | | Labels to remove as a variable (collection of `GDriveLabel` objects or label name strings). Required when `LabelSelectionMode` is `Variable`. |

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
<gsuite:RemoveFileLabelsConnections
    DisplayName="Remove File Labels"
    ConnectionId="[myConnection]"
    LabelSelectionMode="Variable"
    ManualEntrySelectedLabels="[labelsToRemove]">
    <gsuite:RemoveFileLabelsConnections.Item>
        <models:DriveItemArgument InputMode="UrlOrId">
            <models:DriveItemArgument.IdOrUrl>
                <InArgument x:TypeArguments="x:String">[fileIdOrUrl]</InArgument>
            </models:DriveItemArgument.IdOrUrl>
        </models:DriveItemArgument>
    </gsuite:RemoveFileLabelsConnections.Item>
</gsuite:RemoveFileLabelsConnections>
```

## Notes

- Requires a Google Workspace connection with Drive and Drive Labels scopes.
- In `Variable` mode, you can pass either `GDriveLabel` objects or label name strings.
