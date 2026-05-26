# Read Text

`UiPath.GSuite.Activities.ReadTextConnections`

Reads text from a Google Docs document. Can read all text or the content of a specific section.

**Package:** `UiPath.GSuite.Activities`
**Category:** Docs
**Connector:** `uipath-google-docs`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | Document | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | Yes | | The Google Docs document to read from. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |
| `ReadTextMode` | Text to read | `Property` | [`ReadTextMode`](#readtextmode) | Yes | `AllText` | What to read from the document: all text or a specific section. |
| `Section` | Section | `InArgument` | `String` | Conditional | | The section heading to read text from when `ReadTextMode` is `Section`. Required when `ReadTextMode` is `Section`. |
| `MatchCase` | Match case | `Property` | `Boolean` | No | `false` | Whether section matching should be case-sensitive. Visible only when `ReadTextMode` is `Section`. |
| `MatchMode` | Match mode | `Property` | [`MatchMode`](#matchmode) | No | `Contains` | How to match the section text: Contains or Equals. Visible only when `ReadTextMode` is `Section`. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google Workspace connection to use. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `Text` | Text | `OutArgument` | `String` | The text content read from the document. |

## Enum Reference

### `ReadTextMode`

| Value | Description |
|-------|-------------|
| `AllText` | Reads all text from the document. |
| `Section` | Reads the content of a named section. |

### `MatchMode`

| Value | Description |
|-------|-------------|
| `Contains` | The section name contains the search value. |
| `Equals` | The section name exactly equals the search value. |

## XAML Example

```xml
<gsuite:ReadTextConnections
    DisplayName="Read Text"
    ConnectionId="[myConnection]"
    ReadTextMode="AllText"
    Text="[docText]">
    <gsuite:ReadTextConnections.Item>
        <models:DriveItemArgument InputMode="UrlOrId">
            <models:DriveItemArgument.IdOrUrl>
                <InArgument x:TypeArguments="x:String">[documentIdOrUrl]</InArgument>
            </models:DriveItemArgument.IdOrUrl>
        </models:DriveItemArgument>
    </gsuite:ReadTextConnections.Item>
</gsuite:ReadTextConnections>
```

## Notes

- Requires one of the following OAuth scopes: `drive.file`, `documents`, or `drive`.
- `Section` is validated at design time -- a validation error is raised if `ReadTextMode` is `Section` and `Section` has no expression.
- `MatchCase` and `MatchMode` are only visible in the designer when `ReadTextMode` is `Section`.
