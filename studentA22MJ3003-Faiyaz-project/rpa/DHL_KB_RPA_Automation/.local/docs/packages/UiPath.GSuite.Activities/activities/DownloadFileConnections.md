# Download File

`UiPath.GSuite.Activities.DownloadFileConnections`

Downloads a file from Google Drive to a local folder. Google Workspace files (Docs, Sheets, Slides, Drawings) are exported in the specified format.

**Package:** `UiPath.GSuite.Activities`
**Category:** Drive
**Connector:** `uipath-google-drive`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Item` | File | `Property` | [`DriveItemArgument`](components/DriveItemArgument.md) | Yes | | The file to download. See [DriveItemArgument](components/DriveItemArgument.md) for input modes. |
| `DestinationPath` | Destination Path | `InArgument` | `string` | No | | The local path where to save the downloaded file. |
| `ConflictResolution` | Conflict Resolution | `InArgument` | `ConflictBehavior` | No | `Fail` | Behavior when a file with the same name already exists locally. |
| `DownloadDocumentAs` | Download Document As | `InArgument` | `EGDocExportFormat` | No | `Word` | Export format for Google Docs documents. |
| `DownloadSpreadsheetAs` | Download Spreadsheet As | `InArgument` | `EGSheetExportFormat` | No | `Xlsx` | Export format for Google Sheets spreadsheets. |
| `DownloadPresentationAs` | Download Presentation As | `InArgument` | `EGSlideExportFormat` | No | `Ppt` | Export format for Google Slides presentations. |
| `DownloadDrawingAs` | Download Drawing As | `InArgument` | `EGDrawingExportFormat` | No | `Jpeg` | Export format for Google Drawings. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google Workspace connection to use. |

### Output

| Name | Display Name | Kind | Type | Description |
|------|-------------|------|------|-------------|
| `NewResult` | Result | `OutArgument` | `GDriveLocalItem` | The downloaded file as a local item reference. |

## Enum Reference

### `EGDocExportFormat`
| Value | Description |
|-------|-------------|
| `Word` | Microsoft Word (.docx) |
| `OpenDocument` | OpenDocument (.odt) |
| `RichText` | Rich Text (.rtf) |
| `Pdf` | PDF (.pdf) |
| `PlainText` | Plain Text (.txt) |
| `WebPage` | HTML (.html) |
| `EPub` | EPUB (.epub) |

### `EGSheetExportFormat`
| Value | Description |
|-------|-------------|
| `Xlsx` | Microsoft Excel (.xlsx) |
| `Ods` | OpenDocument (.ods) |
| `Pdf` | PDF (.pdf) |
| `WebPage` | HTML (.html) |
| `Csv` | Comma Separated Values (.csv) |
| `Tsv` | Tab Separated Values (.tsv) |

### `EGSlideExportFormat`
| Value | Description |
|-------|-------------|
| `Ppt` | Microsoft PowerPoint (.pptx) |
| `Odp` | OpenDocument (.odp) |
| `Pdf` | PDF (.pdf) |
| `PlainText` | Plain Text (.txt) |

### `EGDrawingExportFormat`
| Value | Description |
|-------|-------------|
| `Pdf` | PDF (.pdf) |
| `Jpeg` | JPEG (.jpg) |
| `Png` | PNG (.png) |
| `Svg` | SVG (.svg) |

### `ConflictBehavior`
| Value | Description |
|-------|-------------|
| `Replace` | Replace the existing item |
| `Fail` | Fail the request if another item with the same name exists |
| `Rename` | Rename the new item to have a unique name |
| `AddSeparate` | Add without renaming, even if same name exists |
| `UseExisting` | Return the existing item |

## XAML Example

```xml
<gsuite:DownloadFileConnections
    DisplayName="Download File"
    ConnectionId="[myConnection]"
    DestinationPath="[&quot;C:\Downloads&quot;]"
    DownloadDocumentAs="[EGDocExportFormat.Word]"
    DownloadSpreadsheetAs="[EGSheetExportFormat.Xlsx]"
    DownloadPresentationAs="[EGSlideExportFormat.Ppt]"
    DownloadDrawingAs="[EGDrawingExportFormat.Jpeg]"
    ConflictResolution="[ConflictBehavior.Fail]"
    NewResult="[localFile]">
    <gsuite:DownloadFileConnections.Item>
        <models:DriveItemArgument InputMode="UrlOrId">
            <models:DriveItemArgument.IdOrUrl>
                <InArgument x:TypeArguments="x:String">[fileIdOrUrl]</InArgument>
            </models:DriveItemArgument.IdOrUrl>
        </models:DriveItemArgument>
    </gsuite:DownloadFileConnections.Item>
</gsuite:DownloadFileConnections>
```

## Notes

- Requires a Google Workspace connection with Drive read scope.
- Export format properties only apply to native Google Workspace files. Regular files (PDF, images, etc.) are downloaded as-is.
