-- Smart Triage: AI-generated category + severity for each report.
alter table public.reports
  add column if not exists category text,
  add column if not exists severity smallint,
  add column if not exists triage_reason text,
  add column if not exists triaged_at timestamptz;

create index if not exists reports_category_idx on public.reports (category);
create index if not exists reports_severity_idx on public.reports (severity);
