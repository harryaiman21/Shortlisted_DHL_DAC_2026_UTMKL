# Morning Briefing Schedule

## Purpose

`MorningBriefing.xaml` sends the NEXUS daily operations briefing email using the Outlook desktop account `nexus.incidents@outlook.com`.

The workflow fetches:

- `GET /api/v1/admin/analytics`
- `GET /api/v1/admin/clusters`

and emails a formatted HTML summary to the configured recipient.

## Change the recipient email

Open [MorningBriefing.xaml](./MorningBriefing.xaml) in UiPath Studio and update the first `Assign` activity:

- `recipientEmail = "ops.manager@dhl.com"`

Replace it with the mailbox you want to receive the briefing.

## Change the send time

Schedule the workflow in UiPath Orchestrator:

1. Publish the UiPath project.
2. In Orchestrator, go to `Automations` -> `Triggers`.
3. Create a new `Time Trigger`.
4. Select `MorningBriefing.xaml` as the process entry point.
5. Set the schedule to run every day at `8:00 AM`.
6. Save the trigger.

If you want a different send time, update the trigger schedule in Orchestrator. No XAML changes are required.

## Run it manually for the demo

For the live demo, do not wait until 8am.

1. Create the file:

   `C:\NEXUS_Watch\trigger_briefing.txt`

2. Open `MorningBriefing.xaml` in UiPath Studio.
3. Click `Run`.
4. The workflow sends the briefing immediately.
5. After a successful send, `trigger_briefing.txt` is deleted automatically.

## Environment requirements

Before running the workflow, make sure:

- The backend is running at `http://127.0.0.1:3001`
- Outlook desktop is open and signed in to `nexus.incidents@outlook.com`
- `NEXUS_API_KEY` or `RPA_API_KEY` is available as an environment variable on the machine

## Notes

- The current backend admin routes require admin cookie auth, so the workflow performs a backend login first and also sends the `X-API-Key` header for compatibility with the existing RPA convention.
- The workflow does not modify `Main.xaml`.
- The briefing email includes the dashboard link `http://localhost:5173`.
