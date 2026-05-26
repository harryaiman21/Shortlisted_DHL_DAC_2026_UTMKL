# Insert Image

`UiPath.GSuite.Activities.InsertImageConnections`

Inserts an image into a Google Docs document at a specified location. The image can be a Google Drive file or any publicly accessible URL.

**Package:** `UiPath.GSuite.Activities`
**Category:** Google Docs
**Connector:** `uipath-google-docs`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | Document | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | Yes | | The target Google Docs document. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |
| `ImageItem` | Image | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | Yes | | The image to insert. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |
| `InsertImageMode` | Location | `Property` | `InsertImageMode` | Yes | `BeginningOfDocument` | Where to insert the image in the document. |
| `Section` | Section | `InArgument` | `string` | Conditional | | The section heading to use as a reference point. Required when using a section-based mode. |
| `MatchCase` | Match Case | `Property` | `bool` | No | `false` | Whether section matching should be case-sensitive. |
| `MatchMode` | Match Mode | `Property` | `MatchMode` | No | `Contains` | How to match the section text: Contains or Equals. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google Workspace connection to use. |

## Enum Reference

### `InsertImageMode`
| Value | Description |
|-------|-------------|
| `BeginningOfDocument` | Inserts the image at the very beginning of the document. |
| `EndOfDocument` | Appends the image at the end of the document. |
| `BeginningOfSection` | Inserts the image at the beginning of a named section. Requires `Section`. |
| `EndOfSection` | Inserts the image at the end of a named section. Requires `Section`. |

### `MatchMode`
| Value | Description |
|-------|-------------|
| `Contains` | Section heading contains the specified text |
| `Equals` | Section heading exactly equals the specified text |

## XAML Example

```xml
<gsuite:InsertImageConnections
    DisplayName="Insert Image"
    ConnectionId="[myConnection]"
    InsertImageMode="EndOfDocument">
    <gsuite:InsertImageConnections.Item>
        <models:DriveItemArgument InputMode="UrlOrId">
            <models:DriveItemArgument.IdOrUrl>
                <InArgument x:TypeArguments="x:String">[documentIdOrUrl]</InArgument>
            </models:DriveItemArgument.IdOrUrl>
        </models:DriveItemArgument>
    </gsuite:InsertImageConnections.Item>
    <gsuite:InsertImageConnections.ImageItem>
        <models:DriveItemArgument InputMode="UrlOrId">
            <models:DriveItemArgument.IdOrUrl>
                <InArgument x:TypeArguments="x:String">[imageUrl]</InArgument>
            </models:DriveItemArgument.IdOrUrl>
        </models:DriveItemArgument>
    </gsuite:InsertImageConnections.ImageItem>
</gsuite:InsertImageConnections>
```

## Notes

- This activity has no output properties -- it modifies the document in place.
- Requires one of the following OAuth scopes: `drive.file`, `documents`, or `drive`.
- External image URLs must be publicly accessible (no authentication required).
- `Section`, `MatchCase`, and `MatchMode` are only relevant when using a section-based `InsertImageMode`.
