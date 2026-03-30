import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/**
 * Shared ingest endpoint — accepts applications from any job board.
 * Maps the incoming payload to the candidates table schema and upserts
 * on (email, job_id) conflict to avoid duplicate candidates.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();

    // Validate required fields
    const requiredFields = ["job_id", "first_name", "last_name", "email"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return new Response(
          JSON.stringify({ error: `Missing required field: ${field}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Look up the default "Applied" stage for this job
    const { data: stages } = await supabase
      .from("pipeline_stages")
      .select("id, name, order")
      .eq("job_id", body.job_id)
      .order("order", { ascending: true });

    const appliedStage = stages?.find((s: { name: string }) => s.name === "Applied") ?? stages?.[0];

    // Map payload to candidates table schema
    const candidate = {
      job_id: body.job_id,
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email.toLowerCase().trim(),
      phone: body.phone ?? "",
      source: body.source ?? "External",
      current_stage_id: appliedStage?.id ?? null,
      applied_at: body.applied_at ?? new Date().toISOString(),
      cover_letter: body.cover_letter ?? null,
      rating: 0,
    };

    // Upsert — ON CONFLICT (email, job_id) DO UPDATE
    const { data, error } = await supabase
      .from("candidates")
      .upsert(candidate, {
        onConflict: "email,job_id",
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, candidate_id: data?.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
