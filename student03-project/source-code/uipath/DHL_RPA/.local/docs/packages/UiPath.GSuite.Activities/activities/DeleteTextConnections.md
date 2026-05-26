# Delete Text

`UiPath.GSuite.Activities.DeleteTextConnections`

Deletes text from a Google Docs document -- either a specific string of text or the entire content of a named section.

**Package:** `UiPath.GSuite.Activities`
**Category:** Docs
**Connector:** `uipath-google-docs`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | Document | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | Yes | | The Google Docs document to delete text from. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |
| `DeleteTextMode` | What to delete | `Property` | [`DeleteTextMode`](#deletetextmode) | Yes | `Text` | How to delete text from a Google Doc. |
| `Text` | Text | `InArgument` | `String` | Conditional | | The text to delete from the document. Required when `DeleteTextMode` is `Text`. |
| `Section` | Section | `InArgument` | `String` | Conditional | | The section to delete from the document. Required when `DeleteTextMode` is `Section`. |
| `MatchCase` | Match case | `InArgument` | `Boolean` | No | `false` | Specifies if the text to be deleted should match case. |
| `MatchMode` | Match mode | `Property` | [`MatchMode`](#matchmode) | No | `Contains` | Specifies how to find a matching section. Visible only when `DeleteTextMode` is `Section`. |
| `DeleteBehavior` | Delete | `Property` | [`ReplaceBehavior`](#replacebehavior) | No | `Once` | Whether to delete the first occurrence or all occurrences of the matched text. Visible only when `DeleteTextMode` is `Text`. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google Workspace connection to use. |

## Enum Reference

### `DeleteTextMode`

| Value | Description |
|-------|-------------|
| `Text` | Deletes the specified text from the document. |
| `Section` | Deletes the content of a section. |

### `ReplaceBehavior`

| Value | Description |
|-------|-------------|
| `Once` | Deletes only the first occurrence. |
| `AllReccurences` | Deletes all occurrences of the text. |

### `MatchMode`

| Value | Description |
|-------|-------------|
| `Contains` | Contains |
| `Equals` | Equals |

## XAML Example

```xml
<gsuite:DeleteTextConnections
    DisplayName="Delete Text"
    ConnectionId="[myConnection]"
    DeleteTextMode="Text"
    Text="[textToDelete]"
    MatchCase="False"
    DeleteBehavior="AllReccurences">
    <gsuite:DeleteTextConnections.Item>
        <models:DriveItemArgument InputMode="UrlOrId">
            <models:DriveItemArgument.IdOrUrl>
                <InArgument x:TypeArguments="x:String">[documentIdOrUrl]</InArgument>
            </models:DriveItemArgument.IdOrUrl>
        </models:DriveItemArgument>
    </gsuite:DeleteTextConnections.Item>
</gsuite:DeleteTextConnections>
```

## Notes

- This activity has no output properties -- it modifies the document in place.
- `MatchCase` is typed as `InArgument<bool>` (expression-bindable), unlike the `Property<bool>` used in some sibling activities.
- `DeleteBehavior` and `MatchMode` are conditionally shown based on the selected `DeleteTextMode`.
