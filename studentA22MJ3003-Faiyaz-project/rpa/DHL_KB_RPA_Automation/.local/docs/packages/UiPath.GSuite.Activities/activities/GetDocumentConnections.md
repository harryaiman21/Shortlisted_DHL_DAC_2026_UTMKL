# Get Document Data

`UiPath.GSuite.Activities.GetDocumentConnections`

Returns the data of a Google Docs document, resolving it by browse selection, URL/ID, relative path, full path, or an existing object.

**Package:** `UiPath.GSuite.Activities`
**Category:** Docs
**Connector:** `uipath-google-docs`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | Document | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | Yes | | The Google Docs document to retrieve. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google Workspace connection to use. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `Result` | Retrieved document data | `OutArgument` | `GoogleDocumentSlim` | The retrieved document data including metadata such as document ID, title, and structure. |

## Output Model

Returns a `GoogleDocumentSlim` with document ID, title, body content structure, and revision information.

## XAML Example

```xml
<gsuite:GetDocumentConnections
    DisplayName="Get Document Data"
    ConnectionId="[myConnection]"
    Result="[docData]">
    <gsuite:GetDocumentConnections.Item>
        <models:DriveItemArgument InputMode="UrlOrId">
            <models:DriveItemArgument.IdOrUrl>
                <InArgument x:TypeArguments="x:String">[documentIdOrUrl]</InArgument>
            </models:DriveItemArgument.IdOrUrl>
        </models:DriveItemArgument>
    </gsuite:GetDocumentConnections.Item>
</gsuite:GetDocumentConnections>
```

## Notes

- Requires one of the following OAuth scopes: `drive.readonly`, `documents.readonly`, `drive`, `drive.file`, or `documents`.
- The returned `GoogleDocumentSlim` object can be passed to other Google Docs activities via the `UseExisting` mode.
