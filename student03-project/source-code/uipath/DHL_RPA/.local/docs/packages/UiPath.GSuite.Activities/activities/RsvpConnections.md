# RSVP

`RsvpConnections`

Responds to a Google Calendar event invitation (Accept, Decline, or Tentative).

**Package:** `UiPath.GSuite.Activities`
**Category:** Calendar
**Connector:** `uipath-google-gmail`

## Properties

### Input

| Name | Display Name | Kind | Type | Required | Default | Description |
|------|-------------|------|------|----------|---------|-------------|
| `Event` | Event | `InArgument` | [`GSuiteEventItem`](types/GSuiteEventItem.md) | Yes | | The event to respond to. |
| `Response` | Response | `InArgument` | [`EventResponseType`](#enum-reference) | No | `Accepted` | The RSVP response to send. |
| `ApplyOnSeries` | Apply On Series | `InArgument` | `bool` | No | `false` | Whether to apply the response on the entire recurring series. |
| `EmailOrganizer` | Email Organizer | `InArgument` | `bool` | No | `false` | Whether to email the organizer with the response. |
| `Comment` | Comment | `InArgument` | `string` | No | | An optional text message to include with the RSVP response. |
| `AdditionalGuests` | Additional Guests | `InArgument` | `int` | No | | The number of additional guests attending beyond the current user. |

### Configuration

| Name | Display Name | Type | Default | Description |
|------|-------------|------|---------|-------------|
| `ConnectionId` | Connection ID | `InArgument<string>` | | The Google connection to use. |

## Enum Reference

| Enum | Values |
|------|--------|
| [`EventResponseType`] | `Declined`, `Tentative`, `Accepted` |

## Notes

- The `Event` property is required.
