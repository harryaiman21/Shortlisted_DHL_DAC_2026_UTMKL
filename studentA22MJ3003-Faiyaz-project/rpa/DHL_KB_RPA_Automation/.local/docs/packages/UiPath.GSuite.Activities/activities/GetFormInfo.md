# Get Form Info

`UiPath.GSuite.Activities.GetFormInfo`

Retrieves metadata and structure information from a Google Form, including its title, description, questions, linked spreadsheet, and responder URI.

**Package:** `UiPath.GSuite.Activities`
**Category:** Forms
**Connector:** `uipath-google-forms`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Form` | Form | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | Yes | | The Google Form to retrieve info from. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google Workspace connection to use. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `Result` | Form Info | `OutArgument` | [`GFormInfo`](types/GFormInfo.md) | The form metadata, including title, description, list of questions, linked sheet ID, and responder URI. |

## Output Model

Returns a [`GFormInfo`](types/GFormInfo.md) with form title, description, questions, linked sheet ID, and responder URI.

## XAML Example

```xml
<gsuite:GetFormInfo
    DisplayName="Get Form Info"
    ConnectionId="[myConnection]"
    Result="[formInfo]">
    <gsuite:GetFormInfo.Form>
        <models:DriveItemArgument InputMode="UrlOrId">
            <models:DriveItemArgument.IdOrUrl>
                <InArgument x:TypeArguments="x:String">[formIdOrUrl]</InArgument>
            </models:DriveItemArgument.IdOrUrl>
        </models:DriveItemArgument>
    </gsuite:GetFormInfo.Form>
</gsuite:GetFormInfo>
```

## Notes

- Requires one of the following OAuth scopes: `forms.body.readonly` or `forms.body`.
