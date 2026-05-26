-- Incident Heatmap: per-report coordinates + raw location text.
-- location_text  = the city/place name (e.g. "Dhaka, Bangladesh") — what
--                  Gemini extracted or what the user typed.
-- latitude/longitude = geocoded result from Nominatim (OpenStreetMap).
alter table public.reports
  add column if not exists location_text text,
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;

create index if not exists reports_latlng_idx
  on public.reports (latitude, longitude)
  where latitude is not null and longitude is not null;
