import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function refreshAccessToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<{ access_token: string; expires_in: number }> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(`Token refresh failed: ${JSON.stringify(data)}`);
  }
  return data;
}

async function getValidAccessToken(
  userId: string
): Promise<string> {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: integration, error } = await supabase
    .from("integrations")
    .select("*")
    .eq("user_id", userId)
    .eq("provider", "google_calendar")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !integration) {
    throw new Error("Google Calendar not connected");
  }

  // Check if token is expired
  const isExpired =
    integration.expires_at && new Date(integration.expires_at) < new Date();

  if (!isExpired && integration.access_token) {
    return integration.access_token;
  }

  // Need to refresh
  if (!integration.refresh_token) {
    throw new Error("No refresh token — please reconnect Google Calendar");
  }

  const clientId = Deno.env.get("GOOGLE_CLIENT_ID")!;
  const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET")!;

  const newTokens = await refreshAccessToken(
    integration.refresh_token,
    clientId,
    clientSecret
  );

  const newExpiresAt = new Date(
    Date.now() + newTokens.expires_in * 1000
  ).toISOString();

  await supabase
    .from("integrations")
    .update({
      access_token: newTokens.access_token,
      expires_at: newExpiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", integration.id);

  return newTokens.access_token;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } =
      await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;
    const body = await req.json();
    const { action } = body;

    const accessToken = await getValidAccessToken(userId);

    // ── CREATE EVENT ──
    if (action === "create_event") {
      const { summary, description, startTime, endTime, attendees, location, createMeetLink } = body;

      const event: Record<string, unknown> = {
        summary,
        description,
        start: { dateTime: startTime, timeZone: "Europe/Vienna" },
        end: { dateTime: endTime, timeZone: "Europe/Vienna" },
        attendees: (attendees ?? []).map((a: { email: string; name?: string }) => ({
          email: a.email,
          displayName: a.name,
        })),
        location,
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 1440 },
            { method: "popup", minutes: 30 },
          ],
        },
        guestsCanModify: false,
        guestsCanInviteOthers: false,
      };

      if (createMeetLink) {
        event.conferenceData = {
          createRequest: {
            requestId: `interview-${Date.now()}`,
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        };
      }

      const calRes = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=${createMeetLink ? 1 : 0}&sendUpdates=all`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        }
      );

      const calData = await calRes.json();
      if (!calRes.ok) {
        return new Response(JSON.stringify({ error: calData }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const meetLink = calData.conferenceData?.entryPoints?.find(
        (ep: { entryPointType: string }) => ep.entryPointType === "video"
      )?.uri;

      return new Response(
        JSON.stringify({
          googleEventId: calData.id,
          meetingLink: meetLink ?? null,
          htmlLink: calData.htmlLink,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── CANCEL EVENT ──
    if (action === "cancel_event") {
      const { googleEventId } = body;
      const calRes = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${googleEventId}?sendUpdates=all`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!calRes.ok && calRes.status !== 404) {
        const errData = await calRes.json().catch(() => ({}));
        return new Response(JSON.stringify({ error: errData }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── CHECK AVAILABILITY ──
    if (action === "check_availability") {
      const { emails, timeMin, timeMax } = body;
      const calRes = await fetch(
        "https://www.googleapis.com/calendar/v3/freeBusy",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            timeMin,
            timeMax,
            items: (emails as string[]).map((id: string) => ({ id })),
          }),
        }
      );

      const calData = await calRes.json();
      return new Response(JSON.stringify(calData), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
