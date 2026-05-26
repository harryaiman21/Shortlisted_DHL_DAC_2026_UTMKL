# Get Drive Labels

`UiPath.GSuite.Activities.GetDriveLabelsConnections`

Retrieves the available Google Drive labels in the workspace organization, optionally filtered.

**Package:** `UiPath.GSuite.Activities`
**Category:** Drive
**Connector:** `uipath-google-drive`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `DriveLabelsType` | Drive Labels Type | `InArgument` | `DriveLabelType` | Yes | `All` | The type of drive labels to retrieve. |
| `Filter` | Filter | `Property` | `LabelFilterCollection` | No | | Filter conditions applied to the drive labels retrieved. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google Workspace connection to use. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `Labels` | Labels | `OutArgument` | `List<GDriveLabel>` | The list of drive labels retrieved. |

## Enum Reference

### `DriveLabelType`
| Value | Description |
|-------|-------------|
| `Badged` | Badged (admin-created) labels |
| `Standard` | Standard (user-created) labels |
| `All` | All label types |

## XAML Example

```xml
<gsuite:GetDriveLabelsConnections
    DisplayName="Get Drive Labels"
    ConnectionId="[myConnection]"
    DriveLabelsType="[DriveLabelType.All]"
    Labels="[driveLabels]" />
```

## Notes

- Requires a Google Workspace connection with Drive and Drive Labels scopes.
- This activity does not use a [`DriveItemArgument`](components/DriveItemArgument.md) for file selection; it retrieves workspace-level labels.
- `DriveLabelsType` is required; the activity will fail validation if not provided.
