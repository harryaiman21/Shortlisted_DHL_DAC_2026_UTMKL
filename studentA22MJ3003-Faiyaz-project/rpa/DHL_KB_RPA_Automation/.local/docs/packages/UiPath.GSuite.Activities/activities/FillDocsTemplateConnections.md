# Fill Document Template

`UiPath.GSuite.Activities.FillDocsTemplateConnections`

Inserts text into marked fields in a Google Docs document. Field markers are delimited by a configurable symbol (e.g. `{{FieldName}}`), and each field is replaced with the mapped value.

**Package:** `UiPath.GSuite.Activities`
**Category:** Docs
**Connector:** `uipath-google-docs`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | Document | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | Yes | | The Google Docs document containing field markers. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |
| `MappedFields` | Document fields | `Property` | `IDictionary<String, InArgument<String>>` | Yes | | The list of fields identified in the selected document and their replacement values. Each entry maps a field name to a string expression. |
| `Symbol` | Symbol | `InArgument` | `String` | Yes | `{{ }}` | The delimiter symbol used to identify document fields. Defaults to double curly brackets `{{FieldName}}`. |

The activity also supports an optional template document (via the "Use document template" designer menu action):

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `TemplateFileId` | Document template | `InArgument` | `String` | No | | The URL or ID of the template document. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google Workspace connection to use. |

## XAML Example

```xml
<gsuite:FillDocsTemplateConnections
    DisplayName="Fill Document Template"
    ConnectionId="[myConnection]"
    Symbol="[symbolValue]">
    <gsuite:FillDocsTemplateConnections.Item>
        <models:DriveItemArgument InputMode="UrlOrId">
            <models:DriveItemArgument.IdOrUrl>
                <InArgument x:TypeArguments="x:String">[documentIdOrUrl]</InArgument>
            </models:DriveItemArgument.IdOrUrl>
        </models:DriveItemArgument>
    </gsuite:FillDocsTemplateConnections.Item>
    <gsuite:FillDocsTemplateConnections.MappedFields>
        <x:Reference>mappedFieldsDictionary</x:Reference>
    </gsuite:FillDocsTemplateConnections.MappedFields>
</gsuite:FillDocsTemplateConnections>
```

## Notes

- This activity has no output properties -- it modifies the document in place.
- A validation error is raised if `Symbol` is empty or has an invalid format. The symbol must consist of valid delimiter parts (e.g. `{{` and `}}`).
- A validation error is raised if `MappedFields` is null or empty.
- Field markers use the format: `{openDelimiter}FieldName{closeDelimiter}`, for example `{{CustomerName}}`.
- When using the browser to select a document, the designer automatically scans the document for field markers and pre-populates `MappedFields`.
