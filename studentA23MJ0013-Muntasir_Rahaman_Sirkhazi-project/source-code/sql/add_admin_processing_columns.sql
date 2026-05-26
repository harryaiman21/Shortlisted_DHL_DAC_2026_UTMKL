alter table public.reports
add column if not exists extracted_text text,
add column if not exists detailed_summary text,
add column if not exists processing_status text not null default 'pending',
add column if not exists processed_at timestamptz;
