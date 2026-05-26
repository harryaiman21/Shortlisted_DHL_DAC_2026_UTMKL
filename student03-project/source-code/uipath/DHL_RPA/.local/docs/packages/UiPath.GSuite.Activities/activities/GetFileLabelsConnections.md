# Get File Labels

`UiPath.GSuite.Activities.GetFileLabelsConnections`

Gets the labels applied to a specific file, including all their field values.

**Package:** `UiPath.GSuite.Activities`
**Category:** Drive
**Connector:** `uipath-google-drive`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | File | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | Yes | | The file to get labels for. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google Workspace connection to use. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `Labels` | Labels | `OutArgument` | `List<GDriveLabel>` | The list of labels applied to the file, with full field details. |

## XAML Example

```xml
<gsuite:GetFileLabelsConnections
    DisplayName="Get File Labels"
    ConnectionId="[myConnection]"
    Labels="[fileLabels]">
    <gsuite:GetFileLabelsConnections.Item>
        <models:DriveItemArgument InputMode="UrlOrId">
            <models:DriveItemArgument.IdOrUrl>
                <InArgument x:TypeArguments="x:String">[fileIdOrUrl]</InArgument>
            </models:DriveItemArgument.IdOrUrl>
        </models:DriveItemArgument>
    </gsuite:GetFileLabelsConnections.Item>
</gsuite:GetFileLabelsConnections>
```

## Notes

- Requires a Google Workspace connection with Drive and Drive Labels scopes.
- Each `GDriveLabel` in the output contains label metadata and field values.
