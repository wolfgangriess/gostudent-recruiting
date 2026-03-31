-- Add unique constraint on (email, job_id) to support upsert in ingest-application
ALTER TABLE public.candidates
  ADD CONSTRAINT candidates_email_job_id_key UNIQUE (email, job_id);
