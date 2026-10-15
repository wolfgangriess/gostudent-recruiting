import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase as typedClient } from "./client";

/**
 * Loosely-typed client for tables not yet in the generated schema
 * (jobs, candidates, offers, pipeline_stages, scorecards, ...).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = typedClient as unknown as SupabaseClient<any, "public", any>;
