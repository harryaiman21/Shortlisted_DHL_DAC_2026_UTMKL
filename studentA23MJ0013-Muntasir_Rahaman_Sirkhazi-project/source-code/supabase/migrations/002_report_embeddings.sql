-- Adds an embedding column to reports for similarity / duplicate detection.
-- Stored as jsonb (array of floats) so this works without the pgvector
-- extension. The Node backend computes cosine similarity in JS.

alter table public.reports
  add column if not exists embedding jsonb,
  add column if not exists embedding_model text;

create index if not exists reports_created_at_idx
  on public.reports (created_at desc);
