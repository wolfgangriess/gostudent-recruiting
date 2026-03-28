
-- ============================================================
-- ATS core tables: jobs, pipeline_stages, candidates,
-- scorecard_templates, scorecard_evaluations, offers
-- ============================================================

-- ENUMS
CREATE TYPE public.workplace_type AS ENUM ('onsite', 'remote', 'hybrid');
CREATE TYPE public.worker_type AS ENUM ('regular', 'internship_trainee', 'fixed_term', 'freelancer');
CREATE TYPE public.employment_type AS ENUM ('full-time', 'part-time', 'contract', 'internship');
CREATE TYPE public.job_status AS ENUM ('open', 'closed', 'draft');
CREATE TYPE public.offer_status AS ENUM ('pending', 'approved', 'rejected');

-- JOBS
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  external_name TEXT,
  department TEXT NOT NULL,
  office TEXT,
  location TEXT NOT NULL DEFAULT '',
  requisition_id TEXT,
  workplace_type public.workplace_type NOT NULL DEFAULT 'onsite',
  worker_type public.worker_type NOT NULL DEFAULT 'regular',
  employment_type public.employment_type NOT NULL DEFAULT 'full-time',
  work_schedule TEXT,
  number_of_openings INTEGER NOT NULL DEFAULT 1,
  reports_to TEXT,
  salary_currency TEXT,
  salary_min NUMERIC,
  salary_max NUMERIC,
  cost_center TEXT,
  job_description_link TEXT,
  level TEXT,
  description TEXT NOT NULL DEFAULT '',
  requirements TEXT NOT NULL DEFAULT '',
  hiring_manager TEXT,       -- auth user id (uuid stored as text for flexibility)
  recruiters TEXT[] NOT NULL DEFAULT '{}',
  hiring_team_ids TEXT[] NOT NULL DEFAULT '{}',
  visibility_ids TEXT[] NOT NULL DEFAULT '{}',
  status public.job_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- PIPELINE STAGES
CREATE TABLE public.pipeline_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  "order" INTEGER NOT NULL DEFAULT 0,
  owner_id TEXT,             -- auth user id
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- CANDIDATES
CREATE TABLE public.candidates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  current_stage_id UUID REFERENCES public.pipeline_stages(id) ON DELETE SET NULL,
  source TEXT NOT NULL DEFAULT '',
  rating INTEGER NOT NULL DEFAULT 0,
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  avatar_url TEXT,
  offered_salary NUMERIC,
  stage_changed_at TIMESTAMP WITH TIME ZONE,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  cv_drive_id TEXT,
  cv_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- SCORECARD TEMPLATES (per pipeline stage)
CREATE TABLE public.scorecard_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stage_id UUID NOT NULL REFERENCES public.pipeline_stages(id) ON DELETE CASCADE UNIQUE,
  criteria JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- SCORECARD EVALUATIONS
CREATE TABLE public.scorecard_evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  stage_id UUID NOT NULL REFERENCES public.pipeline_stages(id) ON DELETE CASCADE,
  evaluator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  scores JSONB NOT NULL DEFAULT '{}',
  feedback TEXT NOT NULL DEFAULT '',
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- OFFERS
CREATE TABLE public.offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  offered_salary NUMERIC NOT NULL,
  status public.offer_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scorecard_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scorecard_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read/write ATS data (team-wide)
CREATE POLICY "Authenticated users can view jobs" ON public.jobs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create jobs" ON public.jobs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update jobs" ON public.jobs FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete jobs" ON public.jobs FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view stages" ON public.pipeline_stages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create stages" ON public.pipeline_stages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update stages" ON public.pipeline_stages FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete stages" ON public.pipeline_stages FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view candidates" ON public.candidates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create candidates" ON public.candidates FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update candidates" ON public.candidates FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete candidates" ON public.candidates FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view scorecard_templates" ON public.scorecard_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage scorecard_templates" ON public.scorecard_templates FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view scorecard_evaluations" ON public.scorecard_evaluations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create scorecard_evaluations" ON public.scorecard_evaluations FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can view offers" ON public.offers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create offers" ON public.offers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update offers" ON public.offers FOR UPDATE TO authenticated USING (true);

-- ============================================================
-- TRIGGERS (updated_at)
-- ============================================================
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON public.candidates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_scorecard_templates_updated_at BEFORE UPDATE ON public.scorecard_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON public.offers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_jobs_department ON public.jobs(department);
CREATE INDEX idx_pipeline_stages_job_id ON public.pipeline_stages(job_id);
CREATE INDEX idx_pipeline_stages_order ON public.pipeline_stages(job_id, "order");
CREATE INDEX idx_candidates_job_id ON public.candidates(job_id);
CREATE INDEX idx_candidates_stage_id ON public.candidates(current_stage_id);
CREATE INDEX idx_candidates_email ON public.candidates(email);
CREATE INDEX idx_scorecard_evaluations_candidate ON public.scorecard_evaluations(candidate_id);
CREATE INDEX idx_scorecard_evaluations_stage ON public.scorecard_evaluations(stage_id);
CREATE INDEX idx_offers_candidate ON public.offers(candidate_id);
CREATE INDEX idx_offers_status ON public.offers(status);
