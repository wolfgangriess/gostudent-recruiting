
-- Create interview status enum
CREATE TYPE public.interview_status AS ENUM ('scheduled', 'completed', 'cancelled');

-- Create integrations table for storing OAuth connections
CREATE TABLE public.integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL DEFAULT 'google_calendar',
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  connected_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider)
);

-- Create interviews table
CREATE TABLE public.interviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id TEXT NOT NULL,
  job_id TEXT NOT NULL,
  stage_id TEXT NOT NULL,
  title TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  description TEXT,
  google_event_id TEXT,
  meeting_link TEXT,
  status interview_status NOT NULL DEFAULT 'scheduled',
  created_by_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create interview attendees table
CREATE TABLE public.interview_attendees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  interview_id UUID NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  user_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_attendees ENABLE ROW LEVEL SECURITY;

-- Integrations: users can only manage their own
CREATE POLICY "Users can view their own integrations" ON public.integrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own integrations" ON public.integrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own integrations" ON public.integrations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own integrations" ON public.integrations FOR DELETE USING (auth.uid() = user_id);

-- Interviews: authenticated users can CRUD (team-wide visibility)
CREATE POLICY "Authenticated users can view interviews" ON public.interviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create interviews" ON public.interviews FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update interviews" ON public.interviews FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete interviews" ON public.interviews FOR DELETE TO authenticated USING (true);

-- Interview attendees: authenticated users can CRUD
CREATE POLICY "Authenticated users can view attendees" ON public.interview_attendees FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create attendees" ON public.interview_attendees FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can delete attendees" ON public.interview_attendees FOR DELETE TO authenticated USING (true);

-- Update timestamp triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON public.integrations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_interviews_updated_at BEFORE UPDATE ON public.interviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_interviews_candidate ON public.interviews(candidate_id);
CREATE INDEX idx_interviews_job ON public.interviews(job_id);
CREATE INDEX idx_interviews_status ON public.interviews(status);
CREATE INDEX idx_interviews_start_time ON public.interviews(start_time);
CREATE INDEX idx_interview_attendees_interview ON public.interview_attendees(interview_id);
