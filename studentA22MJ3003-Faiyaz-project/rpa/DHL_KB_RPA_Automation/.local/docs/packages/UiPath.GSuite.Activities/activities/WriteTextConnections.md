# Write Text

`UiPath.GSuite.Activities.WriteTextConnections`

Writes text into a Google Docs document at a specified location with a chosen paragraph style.

**Package:** `UiPath.GSuite.Activities`
**Category:** Docs
**Connector:** `uipath-google-docs`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | Document | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | Yes | | The Google Docs document to write to. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |
| `Text` | Text | `InArgument` | `String` | Yes | | The text content to write into the document. |
| `WriteTextStyle` | Style | `InArgument` | [`WriteTextStyle`](#writetextstyle) | Yes | `NormalText` | The text style to apply (e.g. NormalText, Heading1). |
| `WriteTextMode` | Location | `Property` | [`WriteTextMode`](#writetextmode) | Yes | `BeginningOfDocument` | Where to write in the document (e.g. beginning, end, or at a section). |
| `Section` | Section | `InArgument` | `String` | Conditional | | The section heading to use as a reference point for text insertion. Required when `WriteTextMode` is `BeginningOfSection` or `EndOfSection`. |
| `MatchCase` | Match case | `Property` | `Boolean` | No | `false` | Whether section matching should be case-sensitive. Visible only when a section-based `WriteTextMode` is selected. |
| `MatchMode` | Match mode | `Property` | [`MatchMode`](#matchmode) | No | `Contains` | How to match the section text: Contains or Equals. Visible only when a section-based `WriteTextMode` is selected. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google Workspace connection to use. |

## Enum Reference

### `WriteTextMode`

| Value | Description |
|-------|-------------|
| `BeginningOfDocument` | Inserts text at the very beginning of the document. |
| `EndOfDocument` | Appends text at the end of the document. |
| `BeginningOfSection` | Inserts text at the beginning of a named section. Requires `Section`. |
| `EndOfSection` | Appends text at the end of a named section. Requires `Section`. |

### `WriteTextStyle`

| Value | Description |
|-------|-------------|
| `NormalText` | Normal text |
| `Title` | Title |
| `Subtitle` | Subtitle |
| `Heading1` | Heading 1 |
| `Heading2` | Heading 2 |
| `Heading3` | Heading 3 |
| `Heading4` | Heading 4 |
| `Heading5` | Heading 5 |
| `Heading6` | Heading 6 |

### `MatchMode`

| Value | Description |
|-------|-------------|
| `Contains` | Contains |
| `Equals` | Equals |

## XAML Example

```xml
<gsuite:WriteTextConnections
    DisplayName="Write Text"
    ConnectionId="[myConnection]"
    WriteTextStyle="NormalText"
    Text="[textContent]"
    WriteTextMode="EndOfDocument">
    <gsuite:WriteTextConnections.Item>
        <models:DriveItemArgument InputMode="UrlOrId">
            <models:DriveItemArgument.IdOrUrl>
                <InArgument x:TypeArguments="x:String">[documentIdOrUrl]</InArgument>
            </models:DriveItemArgument.IdOrUrl>
        </models:DriveItemArgument>
    </gsuite:WriteTextConnections.Item>
</gsuite:WriteTextConnections>
```

## Notes

- This activity has no output properties -- it modifies the document in place.
- Requires one of the following OAuth scopes: `drive.file`, `documents`, or `drive`.
- A validation error is raised if `Text` has no expression.
- A validation error is raised if `WriteTextMode` is `BeginningOfSection` or `EndOfSection` and `Section` has no expression.
- `MatchCase` and `MatchMode` are only visible in the designer when a section-based location mode is selected.
