# GSuite Application Scope

`UiPath.GSuite.Activities.GSuiteApplicationScope`

Legacy authentication scope activity for Google Workspace. Establishes a connection to Google Workspace services using API Key, OAuth Client ID, or Service Account credentials. All classic GSuite activities must be placed inside this scope.

**Package:** `UiPath.GSuite.Activities`
**Category:** General
**Connector:** `uipath-google-workspace`
**Platform:** Windows only

## Properties

### Authentication

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `AuthenticationType` | Authentication Type | `Property` | [`GoogleAuthenticationType`](#googleauthenticationtype) | Yes | `OAuthClientID` | The authentication method to use. |
| `ConfigLocation` | Config Location | `Property` | `ActivityConfigLocation` | No | `PropertiesPanel` | Where the activity stores its configuration. |

### API Key Authentication

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `ApiKey` | API Key | `InArgument` | `String` | Conditional | | API key for API Key authentication. Required when `AuthenticationType` is `ApiKey`. |

### OAuth Client ID Authentication

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `OAuthClient` | OAuth Client | `Property` | `OAuthClient` | No | | The OAuth client configuration to use: UiPath default or custom. |
| `CredentialID` | Client ID | `InArgument` | `String` | Conditional | | OAuth 2.0 Client ID. Required when `OAuthClient` is `CUSTOM`. |
| `CredentialSecret` | Client Secret | `InArgument` | `String` | Conditional | | OAuth 2.0 Client Secret as a string. |
| `SecureCredentialSecret` | Secure Client Secret | `InArgument` | `SecureString` | Conditional | | OAuth 2.0 Client Secret as a SecureString. |
| `User` | User | `InArgument` | `String` | No | | The user account for OAuth authentication. |
| `DataStoreLocation` | Data Store Location | `Property` | `DataStoreLocation` | No | | Where to store the OAuth tokens. |
| `Folder` | Folder | `InArgument` | `String` | No | | The folder path for token storage. |

### Service Account Authentication

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `KeyType` | Key Type | `Property` | [`ServiceAccountKeyType`](#serviceaccountkeytype) | No | `JSON` | The type of the service account key file. |
| `KeyPath` | Key Path | `InArgument` | `String` | Conditional | | Path to the service account key file. Required for both JSON and P12 key types. |
| `ServiceAccountEmail` | Service Account Email | `InArgument` | `String` | Conditional | | The service account email. Required when `KeyType` is `P12`. |
| `Password` | Password | `InArgument` | `String` | No | `notasecret` | The password for the P12 key file. |
| `UserEmail` | User Email | `InArgument` | `String` | Conditional | | The email of the user to impersonate (for domain-wide delegation). Required when `HasDomainWideAccesss` is `true`. |
| `HasDomainWideAccesss` | Has Domain Wide Access | `Property` | `Boolean` | No | `false` | Whether this service account has domain-wide delegation. |
| `BucketName` | Bucket Name | `InArgument` | `String` | No | | The Orchestrator storage bucket name for credentials. |

### Common

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `TimeoutMS` | Timeout (ms) | `InArgument` | `Int32` | No | | The timeout in milliseconds for API calls. |
| `ContinueOnError` | Continue On Error | `InArgument` | `Boolean` | No | `false` | Whether to continue execution if the activity encounters an error. |

## Enum Reference

### `GoogleAuthenticationType`

| Value | Description |
|-------|-------------|
| `ApiKey` | Authenticate using a Google API Key. Limited to read-only public data operations. |
| `OAuthClientID` | Authenticate using OAuth 2.0 Client ID and Client Secret. The user is prompted to authorize on first use. |
| `ServiceAccountKey` | Authenticate using a service account JSON or P12 key file. Optionally impersonate a user via `UserEmail`. |
| `IntegrationService` | Authenticate using UiPath Integration Service connections. |

### `ServiceAccountKeyType`

| Value | Description |
|-------|-------------|
| `JSON` | JSON key file format. |
| `P12` | P12/PKCS12 key file format. Requires `ServiceAccountEmail` and `Password`. |

## XAML Example

```xml
<gsuite:GSuiteApplicationScope
    DisplayName="GSuite Application Scope"
    AuthenticationType="OAuthClientID"
    CredentialID="[clientId]"
    CredentialSecret="[clientSecret]"
    xmlns:gsuite="clr-namespace:UiPath.GSuite.Activities;assembly=UiPath.GSuite.Activities">
  <!-- Child activities go here -->
</gsuite:GSuiteApplicationScope>
```

## Notes

- **Windows only** -- this activity is not available in cross-platform (Linux) robots.
- This is the **legacy** authentication scope. New workflows should use the modern Connection-based authentication (the `*Connections` activities do not require this scope).
- Activities placed inside this scope use the credentials configured here.
- Authentication scopes are automatically calculated from child activities at runtime.
