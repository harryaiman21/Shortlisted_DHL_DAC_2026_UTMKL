# Find and Replace Text

`UiPath.GSuite.Activities.FindAndReplaceTextConnections`

Finds and replaces the specified text inside the body of a Google Docs document.

**Package:** `UiPath.GSuite.Activities`
**Category:** Docs
**Connector:** `uipath-google-docs`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | Document | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | Yes | | The Google Docs document to find and replace text in. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |
| `FindWhat` | Find | `InArgument` | `String` | Yes | | The text to be found in the document. |
| `ReplaceWith` | Replace with | `InArgument` | `String` | Yes | | The replacement text. |
| `MatchCase` | Match case | `InArgument` | `Boolean` | No | `false` | Specifies if the searched text should have the same case. |
| `ReplaceBehavior` | Replace | `Property` | [`ReplaceBehavior`](#replacebehavior) | No | `Once` | Specifies the replace behavior for the searched text. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google Workspace connection to use. |

## Enum Reference

### `ReplaceBehavior`

| Value | Description |
|-------|-------------|
| `Once` | Replaces only the first occurrence of the text. |
| `AllReccurences` | Replaces all occurrences of the text. |

## XAML Example

```xml
<gsuite:FindAndReplaceTextConnections
    DisplayName="Find and Replace Text"
    ConnectionId="[myConnection]"
    FindWhat="[findText]"
    ReplaceWith="[replaceText]"
    MatchCase="False"
    ReplaceBehavior="Once">
    <gsuite:FindAndReplaceTextConnections.Item>
        <models:DriveItemArgument InputMode="UrlOrId">
            <models:DriveItemArgument.IdOrUrl>
                <InArgument x:TypeArguments="x:String">[documentIdOrUrl]</InArgument>
            </models:DriveItemArgument.IdOrUrl>
        </models:DriveItemArgument>
    </gsuite:FindAndReplaceTextConnections.Item>
</gsuite:FindAndReplaceTextConnections>
```

## Notes

- This activity has no output properties -- it modifies the document in place.
- Both `FindWhat` and `ReplaceWith` are required; a validation error is raised at design time if either has no expression.
- The replacement is performed across the entire document body. There is no option to restrict it to a section.
