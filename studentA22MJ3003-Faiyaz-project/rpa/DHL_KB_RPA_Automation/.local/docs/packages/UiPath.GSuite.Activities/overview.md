# UiPath.GSuite.Activities — Overview

`UiPath.GSuite.Activities`

Activities for automating Google Workspace services: Gmail, Google Calendar, Google Drive, Google Sheets, Google Docs, Google Tasks, Google Forms, and Apps Script.

**XAML namespace:** `xmlns:gsuite="clr-namespace:UiPath.GSuite.Activities;assembly=UiPath.GSuite.Activities"`

## Documentation

Per-activity reference documentation is in the [activities/](activities/) directory. Coded workflow API documentation is in [coded/coded-api.md](coded/coded-api.md).

### Reference Documentation

Detailed reference docs for shared types used across activities:

- **[Types](activities/types/)** — Complex input/output object types (GDriveRemoteItem, GSuiteEventItem, GmailMessage, etc.)
- **[Components](activities/components/)** — Composition argument types with input modes and per-mode properties (DriveItemArgument, CalendarArgument, etc.)
- **[Filters](activities/filtering/)** — Filter collection types with criteria, operators, and XAML examples

## Activities

### Gmail

| Activity | Description |
|----------|-------------|
| [SendEmailConnections](activities/SendEmailConnections.md) | Send a new Gmail message. |
| [ReplyToEmailConnections](activities/ReplyToEmailConnections.md) | Reply to an existing Gmail message. |
| [ForwardEmailConnections](activities/ForwardEmailConnections.md) | Forward a Gmail message to recipients. |
| [GetEmailListConnections](activities/GetEmailListConnections.md) | Retrieve a list of Gmail messages matching filter criteria. |
| [GetEmailByIdConnections](activities/GetEmailByIdConnections.md) | Retrieve a Gmail message by its unique ID. |
| [GetEmailThreadConnections](activities/GetEmailThreadConnections.md) | Retrieve all messages in a Gmail thread. |
| [GetNewestEmailConnections](activities/GetNewestEmailConnections.md) | Retrieve the most recent Gmail message matching filter criteria. |
| [ForEachEmailConnections](activities/ForEachEmailConnections.md) | Iterate over Gmail messages matching filter criteria. |
| [DownloadEmailConnections](activities/DownloadEmailConnections.md) | Download a Gmail message to a local EML file. |
| [DownloadAttachmentsConnections](activities/DownloadAttachmentsConnections.md) | Download attachments from a Gmail message to a local folder. |
| [DeleteEmailConnections](activities/DeleteEmailConnections.md) | Delete a Gmail message (move to Trash or permanently). |
| [ArchiveEmailConnections](activities/ArchiveEmailConnections.md) | Archive a Gmail message by removing it from the Inbox. |
| [MoveEmailConnections](activities/MoveEmailConnections.md) | Move a Gmail message to a different label or folder. |
| [MarkAsReadUnreadConnections](activities/MarkAsReadUnreadConnections.md) | Mark a Gmail message as read or unread. |
| [ApplyEmailLabelsConnections](activities/ApplyEmailLabelsConnections.md) | Apply Gmail labels to a message. |
| [RemoveEmailLabelsConnections](activities/RemoveEmailLabelsConnections.md) | Remove Gmail labels from a message. |
| [GetGmailLabelConnections](activities/GetGmailLabelConnections.md) | Retrieve detailed information about a Gmail label by ID. |
| [GetGmailLabelsListConnections](activities/GetGmailLabelsListConnections.md) | Retrieve all Gmail labels for the authenticated user. |
| [TurnOnAutomaticRepliesConnections](activities/TurnOnAutomaticRepliesConnections.md) | Enable Gmail automatic replies (vacation responder). |
| [TurnOffAutomaticRepliesConnections](activities/TurnOffAutomaticRepliesConnections.md) | Disable Gmail automatic replies. |
| [WaitForEmailReceivedConnections](activities/WaitForEmailReceivedConnections.md) | Wait until a new Gmail message matching the filter is received. |
| [WaitForEmailSentConnections](activities/WaitForEmailSentConnections.md) | Wait until a Gmail message matching the filter is sent. |
| [NewEmailReceived](activities/NewEmailReceived.md) | **Trigger** — fires when a new Gmail message is received. |
| [EmailSent](activities/EmailSent.md) | **Trigger** — fires when a Gmail message is sent. |

---

### Google Calendar

| Activity | Description |
|----------|-------------|
| [CreateEventConnections](activities/CreateEventConnections.md) | Create a new calendar event. |
| [ModifyEventConnections](activities/ModifyEventConnections.md) | Modify an existing calendar event. |
| [DeleteEventConnections](activities/DeleteEventConnections.md) | Delete a calendar event. |
| [GetEventByIdConnections](activities/GetEventByIdConnections.md) | Retrieve a calendar event by its ID. |
| [GetEventListConnections](activities/GetEventListConnections.md) | Retrieve a list of calendar events matching filter criteria. |
| [GetCalendarsConnections](activities/GetCalendarsConnections.md) | Retrieve all calendars for the authenticated user. |
| [ForEachEventConnections](activities/ForEachEventConnections.md) | Iterate over calendar events. |
| [ForwardEventConnections](activities/ForwardEventConnections.md) | Forward a calendar event invitation to additional recipients. |
| [RsvpConnections](activities/RsvpConnections.md) | Accept, tentatively accept, or decline a calendar event invitation. |
| [WaitForEventCreated](activities/WaitForEventCreated.md) | Wait until a new calendar event is created. |
| [WaitForEventInvitationReceived](activities/WaitForEventInvitationReceived.md) | Wait until a calendar event invitation is received. |
| [WaitForEventReplied](activities/WaitForEventReplied.md) | Wait until an attendee replies to a calendar event. |
| [WaitForEventUpdated](activities/WaitForEventUpdated.md) | Wait until a calendar event is updated. |
| [NewEventCreated](activities/NewEventCreated.md) | **Trigger** — fires when a new calendar event is created. |
| [NewEventInvitationReceived](activities/NewEventInvitationReceived.md) | **Trigger** — fires when a calendar event invitation is received. |
| [EventReplied](activities/EventReplied.md) | **Trigger** — fires when an attendee replies to a calendar event. |
| [EventUpdated](activities/EventUpdated.md) | **Trigger** — fires when a calendar event is updated. |

---

### Google Drive

| Activity | Description |
|----------|-------------|
| [GetFileListConnections](activities/GetFileListConnections.md) | Retrieve a list of files and folders from a Drive folder. |
| [ForEachFileFolderConnections](activities/ForEachFileFolderConnections.md) | Iterate over files and folders in a Drive folder. |
| [GetFileFolderConnections](activities/GetFileFolderConnections.md) | Retrieve a file or folder by ID, URL, or path. |
| [GetFileFolderInfoConnections](activities/GetFileFolderInfoConnections.md) | Retrieve detailed metadata for a file or folder. |
| [CreateFolderConnections](activities/CreateFolderConnections.md) | Create a new folder in Google Drive. |
| [UploadFilesConnections](activities/UploadFilesConnections.md) | Upload one or more local files to Google Drive. |
| [DownloadFileConnections](activities/DownloadFileConnections.md) | Download a file from Google Drive to a local folder. |
| [MoveFileConnections](activities/MoveFileConnections.md) | Move a file to a different folder in Google Drive. |
| [CopyFileConnections](activities/CopyFileConnections.md) | Copy a file to a destination folder in Google Drive. |
| [RenameFileFolderConnections](activities/RenameFileFolderConnections.md) | Rename a file or folder in Google Drive. |
| [DeleteFileOrFolderConnections](activities/DeleteFileOrFolderConnections.md) | Delete a file or folder (move to Trash or permanently). |
| [ShareFileFolderConnections](activities/ShareFileFolderConnections.md) | Share a file or folder with a user, group, domain, or anyone. |
| [GetFileFolderPermissionsConnections](activities/GetFileFolderPermissionsConnections.md) | Retrieve sharing permissions for a file or folder. |
| [UpdateFileFolderPermissionConnections](activities/UpdateFileFolderPermissionConnections.md) | Update a sharing permission on a file or folder. |
| [DeleteFileFolderPermissionConnections](activities/DeleteFileFolderPermissionConnections.md) | Remove a sharing permission from a file or folder. |
| [CreateSpreadsheetConnections](activities/CreateSpreadsheetConnections.md) | Create a new Google Sheets spreadsheet in Drive. |
| [CreateDocumentConnections](activities/CreateDocumentConnections.md) | Create a new Google Docs document in Drive. |
| [ApplyFileLabelsConnections](activities/ApplyFileLabelsConnections.md) | Apply Drive labels and field values to a file. |
| [GetFileLabelsConnections](activities/GetFileLabelsConnections.md) | Retrieve Drive labels applied to a file. |
| [RemoveFileLabelsConnections](activities/RemoveFileLabelsConnections.md) | Remove Drive labels from a file. |
| [ClearFileLabelFieldsConnections](activities/ClearFileLabelFieldsConnections.md) | Clear field values on Drive labels applied to a file. |
| [GetDriveLabelsConnections](activities/GetDriveLabelsConnections.md) | Retrieve available Drive labels in the organization. |
| [WaitForFileCreated](activities/WaitForFileCreated.md) | Wait until a new file is created in a Drive folder. |
| [WaitForFileUpdated](activities/WaitForFileUpdated.md) | Wait until a file in a Drive folder is updated. |
| [WaitForFolderCreated](activities/WaitForFolderCreated.md) | Wait until a new folder is created in Drive. |
| [NewFileCreated](activities/NewFileCreated.md) | **Trigger** — fires when a new file is created in a Drive folder. |
| [FileUpdated](activities/FileUpdated.md) | **Trigger** — fires when a file in a Drive folder is updated. |
| [NewFolderCreated](activities/NewFolderCreated.md) | **Trigger** — fires when a new folder is created in Drive. |

---

### Google Sheets

| Activity | Description |
|----------|-------------|
| [ReadCellConnections](activities/ReadCellConnections.md) | Read the value of a single cell. |
| [WriteCellConnections](activities/WriteCellConnections.md) | Write a value to a single cell. |
| [ReadRangeConnections](activities/ReadRangeConnections.md) | Read a cell range into a DataTable. |
| [WriteRangeConnections](activities/WriteRangeConnections.md) | Write a DataTable to a cell range. |
| [ReadRowConnections](activities/ReadRowConnections.md) | Read a single row starting at a specified cell. |
| [ReadColumnConnections](activities/ReadColumnConnections.md) | Read a single column starting at a specified cell. |
| [WriteRowConnections](activities/WriteRowConnections.md) | Write a DataRow or array to a row. |
| [WriteColumnConnections](activities/WriteColumnConnections.md) | Write a DataColumn or array to a column. |
| [ForEachRowConnections](activities/ForEachRowConnections.md) | Iterate over rows in a range. |
| [ForEachSheetConnections](activities/ForEachSheetConnections.md) | Iterate over all sheets in a spreadsheet. |
| [DeleteRangeConnections](activities/DeleteRangeConnections.md) | Delete a cell range and shift remaining cells. |
| [DeleteRowsConnections](activities/DeleteRowsConnections.md) | Delete specified rows from a sheet. |
| [DeleteColumnConnections](activities/DeleteColumnConnections.md) | Delete a specified column from a sheet. |
| [AddSheetConnections](activities/AddSheetConnections.md) | Add a new sheet (tab) to a spreadsheet. |
| [DeleteSheetConnections](activities/DeleteSheetConnections.md) | Delete a sheet (tab) from a spreadsheet. |
| [RenameSheetConnections](activities/RenameSheetConnections.md) | Rename a sheet (tab) in a spreadsheet. |
| [CopyPasteRangeConnections](activities/CopyPasteRangeConnections.md) | Copy a cell range and paste it to a destination. |
| [AutoFillRangeConnections](activities/AutoFillRangeConnections.md) | Extend a pattern or formula from a seed range. |
| [SetRangeColorConnections](activities/SetRangeColorConnections.md) | Set the background color for a cell range. |
| [GetCellColorConnections](activities/GetCellColorConnections.md) | Retrieve the background color of a cell. |
| [WaitForSheetCreated](activities/WaitForSheetCreated.md) | Wait until a new sheet is created in a spreadsheet. |
| [WaitForSheetCellUpdated](activities/WaitForSheetCellUpdated.md) | Wait until a specific cell is updated. |
| [WaitForSheetRowAdded](activities/WaitForSheetRowAdded.md) | Wait until a new row is added to a sheet. |
| [SheetCreated](activities/SheetCreated.md) | **Trigger** — fires when a new sheet is created. |
| [SheetCellUpdated](activities/SheetCellUpdated.md) | **Trigger** — fires when a cell is updated. |
| [RowAddedToSheetBottom](activities/RowAddedToSheetBottom.md) | **Trigger** — fires when a row is added to the bottom of a sheet. |

---

### Google Docs

| Activity | Description |
|----------|-------------|
| [GetDocumentConnections](activities/GetDocumentConnections.md) | Retrieve a Google Docs document. |
| [ReadTextConnections](activities/ReadTextConnections.md) | Read text content from a Google Docs document. |
| [WriteTextConnections](activities/WriteTextConnections.md) | Write or append text to a Google Docs document. |
| [DeleteTextConnections](activities/DeleteTextConnections.md) | Delete text from a Google Docs document. |
| [FindAndReplaceTextConnections](activities/FindAndReplaceTextConnections.md) | Find and replace text in a Google Docs document. |
| [FillDocsTemplateConnections](activities/FillDocsTemplateConnections.md) | Fill a Google Docs template by replacing placeholders. |
| [InsertImageConnections](activities/InsertImageConnections.md) | Insert an image into a Google Docs document. |

---

### Google Tasks

| Activity | Description |
|----------|-------------|
| [CreateTaskConnections](activities/CreateTaskConnections.md) | Create a new task in a task list. |
| [UpdateTaskConnections](activities/UpdateTaskConnections.md) | Update an existing task. |
| [DeleteTaskConnections](activities/DeleteTaskConnections.md) | Delete a task from a task list. |
| [CompleteTaskConnections](activities/CompleteTaskConnections.md) | Mark a task as completed. |
| [GetTaskConnections](activities/GetTaskConnections.md) | Retrieve a task by its ID. |
| [GetTasksConnections](activities/GetTasksConnections.md) | Retrieve a list of tasks from a task list. |
| [GetTaskListConnections](activities/GetTaskListConnections.md) | Retrieve a specific task list by ID. |
| [GetTaskListsConnections](activities/GetTaskListsConnections.md) | Retrieve all task lists for the authenticated user. |
| [CreateTaskListConnections](activities/CreateTaskListConnections.md) | Create a new task list. |
| [DeleteTaskListConnections](activities/DeleteTaskListConnections.md) | Delete a task list. |
| [RenameTaskListConnections](activities/RenameTaskListConnections.md) | Rename a task list. |
| [WaitForTaskCompleted](activities/WaitForTaskCompleted.md) | Wait until a task is marked as completed. |
| [WaitForTaskCreated](activities/WaitForTaskCreated.md) | Wait until a new task is created. |
| [TaskCompleted](activities/TaskCompleted.md) | **Trigger** — fires when a task is completed. |
| [TaskCreated](activities/TaskCreated.md) | **Trigger** — fires when a new task is created. |

---

### Google Forms

| Activity | Description |
|----------|-------------|
| [GetFormInfo](activities/GetFormInfo.md) | Retrieve metadata and structure of a Google Form. |
| [GetFormResponseList](activities/GetFormResponseList.md) | Retrieve responses submitted to a Google Form. |
| [FormResponseCreated](activities/FormResponseCreated.md) | **Trigger** — fires when a new form response is submitted. |
| [FormResponseUpdated](activities/FormResponseUpdated.md) | **Trigger** — fires when an existing form response is updated. |

---

### Apps Script

| Activity | Description |
|----------|-------------|
| [RunScriptConnections](activities/RunScriptConnections.md) | Execute a Google Apps Script function. |

### General

| Activity | Description |
|----------|-------------|
| [HttpRequestConnections](activities/HttpRequestConnections.md) | Make an HTTP request using Google OAuth authentication. |
| [GSuiteApplicationScope](activities/GSuiteApplicationScope.md) | **Windows only.** Container activity that provides Google Workspace connection context to child activities. |

---

## Composition Patterns for AI Workflow Generation

GSuite activities use **composition argument objects** to select files, calendars, folders, and tasks. Each argument has an `InputMode` enum that determines which sub-properties are required. Understanding these patterns is essential for generating valid XAML.

### Item Selection Pattern

See the [components reference](activities/components/) for full details on each argument type.

| Argument Type | Available Modes | Details |
|--------------|----------------|---------|
| [`DriveItemArgument`](activities/components/DriveItemArgument.md) | Browse, UrlOrId, UseExisting, FullPath, RelativePath | File/folder selection |
| [`CalendarArgument`](activities/components/CalendarArgument.md) | Browse, UseExisting | Calendar selection |
| [`FolderArgument`](activities/components/FolderArgument.md) | Browse, EnterPath | Gmail label/folder selection |
| [`ListOrTaskItemArgument`](activities/components/ListOrTaskItemArgument.md) | Browse, UrlOrId, FullPath, UseExisting | Task list/task selection |
| [`TaskItemArgument`](activities/components/TaskItemArgument.md) | Browse, UrlOrId, FullPath, UseExisting | Specific task selection (requires both ListId + TaskId in UrlOrId mode) |

### Model Types Quick Reference

Activities return these model types as `OutArgument<T>`. See the [types reference](activities/types/) for full property lists.

- [`GDriveRemoteItem`](activities/types/GDriveRemoteItem.md) — Drive file/folder with ID, Name, FullName, Extension, Url, MimeType, IsFolder, SizeInBytes
- [`GSuiteEventItem`](activities/types/GSuiteEventItem.md) — Calendar event with Id, Summary, Description, Start, End, Location, Attendees, Organizer
- [`DateTimeTimeZone`](activities/types/DateTimeTimeZone.md) — Date/time with IANA timezone identifier
- [`GSuiteEventAttendee`](activities/types/GSuiteEventAttendee.md) — Event attendee with DisplayName, Email, ResponseStatus
- [`GSuiteOrganizer`](activities/types/GSuiteOrganizer.md) — Event organizer with DisplayName, Email
- [`GSuiteCalendarItem`](activities/types/GSuiteCalendarItem.md) — Calendar with Id, Summary, Description, Location, TimeZone, Primary
- [`GmailMessage`](activities/types/GmailMessage.md) — Email with MessageId, ThreadId, Subject, Body, FromAddress, ToAddressList
- [`GTask`](activities/types/GTask.md) — Task with Title, Notes, Status, Due, ParentListId
- [`GTaskList`](activities/types/GTaskList.md) — Task list with Title, Url, Id
- [`GDriveItemPermission`](activities/types/GDriveItemPermission.md) — Drive file/folder permission with Role, Type, EmailAddress
- [`GFormInfo`](activities/types/GFormInfo.md) — Google Form with Title, Description, ResponseUri, Questions

### Filter Pattern

See the [filtering reference](activities/filtering/) for full details.

- [`FileFilterArgument`](activities/filtering/FileFilterArgument.md) — Drive file filtering by name, MIME type, date, owner, labels
- [`MailFilterCollection`](activities/filtering/MailFilterCollection.md) — Gmail message filtering by subject, sender, recipient, date, labels
- [`FilenameFilterCollection`](activities/filtering/FilenameFilterCollection.md) — Attachment filename filtering
- [`TaskFilterCollection`](activities/filtering/TaskFilterCollection.md) — Task filtering by title, due date, status
- [`TaskListFilterCollection`](activities/filtering/TaskListFilterCollection.md) — Task list filtering by name

