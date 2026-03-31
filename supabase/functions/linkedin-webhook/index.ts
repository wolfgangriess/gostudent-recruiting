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

    // LinkedIn Easy Apply payload fields
    const firstName: string = body.firstName ?? body.first_name ?? "";
    const lastName: string = body.lastName ?? body.last_name ?? "";
    const email: string = body.email ?? "";
    const phone: string = body.phone ?? "";
    const resumeUrl: string = body.resumeUrl ?? body.resume_url ?? "";
    const linkedInProfileUrl: string = body.linkedInProfileUrl ?? body.linkedin_profile_url ?? "";
    const jobKey: string = body.jobKey ?? body.job_key ?? "";

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
        .eq("platform", "linkedin")
        .eq("external_id", jobKey)
        .maybeSingle();
      jobId = extRow?.job_id ?? null;
    }

    // Fallback: use first published/open job
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

    // Build candidate record
    const candidate: Record<string, unknown> = {
      job_id: jobId,
      first_name: firstName,
      last_name: lastName,
      email: email.toLowerCase().trim(),
      phone,
      source: "LinkedIn",
      current_stage_id: appliedStage?.id ?? null,
      applied_at: new Date().toISOString(),
      cv_url: resumeUrl || null,
      rating: 0,
    };

    // Attempt to store LinkedIn profile URL (column may not exist yet — fail gracefully)
    try {
      candidate.linkedin_url = linkedInProfileUrl || null;
    } catch { /* column not available */ }

    const { error: upsertError } = await supabase
      .from("candidates")
      .upsert(candidate, { onConflict: "email,job_id", ignoreDuplicates: false });

    if (upsertError) {
      // Retry without linkedin_url in case the column doesn't exist
      delete candidate.linkedin_url;
      const { error: retryError } = await supabase
        .from("candidates")
        .upsert(candidate, { onConflict: "email,job_id", ignoreDuplicates: false });
      if (retryError) throw retryError;
    }

    // Fire-and-forget Slack notification
    const slackUrl = Deno.env.get("SLACK_WEBHOOK_URL");
    if (slackUrl) {
      fetch(slackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `🎯 Neue Bewerbung: ${firstName} ${lastName} via LinkedIn` }),
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
