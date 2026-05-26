# Get Form Response List

`UiPath.GSuite.Activities.GetFormResponseList`

Retrieves a list of responses submitted to a Google Form, optionally filtered by submission time.

**Package:** `UiPath.GSuite.Activities`
**Category:** Forms
**Connector:** `uipath-google-forms`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Form` | Form | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | Yes | | The Google Form to retrieve responses from. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |
| `SubmittedAfter` | Submitted After | `InArgument` | `DateTime` | No | | Only return form responses submitted after this date and time. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google Workspace connection to use. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `Result` | Responses | `OutArgument` | `IList<GFormResponse>` | The list of form responses matching the filter. |

## Output Model

Returns a list of `GFormResponse` items.

## XAML Example

```xml
<gsuite:GetFormResponseList
    DisplayName="Get Form Responses"
    ConnectionId="[myConnection]"
    SubmittedAfter="[DateTime.Today.AddDays(-7)]"
    Result="[responses]">
    <gsuite:GetFormResponseList.Form>
        <models:DriveItemArgument InputMode="UrlOrId">
            <models:DriveItemArgument.IdOrUrl>
                <InArgument x:TypeArguments="x:String">[formIdOrUrl]</InArgument>
            </models:DriveItemArgument.IdOrUrl>
        </models:DriveItemArgument>
    </gsuite:GetFormResponseList.Form>
</gsuite:GetFormResponseList>
```

## Notes

- Requires one of the following OAuth scopes: `forms.responses.readonly`.
- Use `SubmittedAfter` to narrow results to recent responses.
