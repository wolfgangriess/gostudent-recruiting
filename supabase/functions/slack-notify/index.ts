const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const eventMessages: Record<string, (d: Record<string, string>) => string> = {
  new_application: (d) => `🎯 Neue Bewerbung: ${d.candidateName} für ${d.jobTitle} via ${d.source || "Unbekannt"}`,
  interview_scheduled: (d) => `📅 Interview geplant: ${d.candidateName} für ${d.jobTitle}`,
  offer_created: (d) => `💼 Angebot erstellt: ${d.candidateName} für ${d.jobTitle}`,
  offer_approved: (d) => `✅ Angebot genehmigt: ${d.candidateName} für ${d.jobTitle}`,
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
    const slackUrl = Deno.env.get("SLACK_WEBHOOK_URL");

    // Silently succeed if no webhook is configured — not a failure state
    if (!slackUrl) {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { event, candidateName = "", jobTitle = "", source = "", recruiterEmail = "" } = body;

    const messageFn = eventMessages[event as string];
    const text = messageFn
      ? messageFn({ candidateName, jobTitle, source, recruiterEmail })
      : `📌 ${event}: ${candidateName} – ${jobTitle}`;

    // Fire-and-forget — never fail the caller if Slack is down
    fetch(slackUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    }).catch(() => {});

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
