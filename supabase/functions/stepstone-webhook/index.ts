import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
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

    // StepStone payload uses nested applicant/position objects
    const applicant = body.applicant ?? body;
    const position = body.position ?? {};

    const firstName: string = applicant.firstName ?? applicant.first_name ?? "";
    const lastName: string = applicant.lastName ?? applicant.last_name ?? "";
    const email: string = applicant.email ?? "";
    const phone: string = applicant.phone ?? "";
    const cvUrl: string = applicant.cvUrl ?? applicant.cv_url ?? "";
    const jobKey: string = position.jobKey ?? position.job_key ?? body.jobKey ?? "";

    if (!email || !firstName || !lastName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: firstName, lastName, email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Resolve job_id from job_external_ids table
    let jobId: string | null = null;

    if (jobKey) {
      const { data: extRow } = await supabase
        .from("job_external_ids")
        .select("job_id")
        .eq("platform", "stepstone")
        .eq("external_id", jobKey)
        .maybeSingle();
      jobId = extRow?.job_id ?? null;
    }

    // Fallback: use first open job
    if (!jobId) {
      const { data: fallbackJob } = await supabase
        .from("jobs")
        .select("id")
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      jobId = fallbackJob?.id ?? null;
    }

    if (!jobId) {
      return new Response(
        JSON.stringify({ error: "No matching job found and no open jobs available" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Look up Applied stage for this job
    const { data: stages } = await supabase
      .from("pipeline_stages")
      .select("id, name, order")
      .eq("job_id", jobId)
      .order("order", { ascending: true });

    const appliedStage = stages?.find((s: { name: string }) => s.name === "Applied") ?? stages?.[0];

    const candidate = {
      job_id: jobId,
      first_name: firstName,
      last_name: lastName,
      email: email.toLowerCase().trim(),
      phone,
      source: "StepStone",
      current_stage_id: appliedStage?.id ?? null,
      applied_at: new Date().toISOString(),
      cv_url: cvUrl || null,
      rating: 0,
    };

    const { error: upsertError } = await supabase
      .from("candidates")
      .upsert(candidate, { onConflict: "email,job_id", ignoreDuplicates: false });

    if (upsertError) throw upsertError;

    // Fire-and-forget Slack notification
    const slackUrl = Deno.env.get("SLACK_WEBHOOK_URL");
    if (slackUrl) {
      fetch(slackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `🎯 Neue Bewerbung: ${firstName} ${lastName} via StepStone` }),
      }).catch(() => {});
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
