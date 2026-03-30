import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const stateParam = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    // Default fallback origin (used only if state is missing/invalid)
    const fallbackOrigin =
      Deno.env.get("APP_ORIGIN") || "https://id-preview--121fd063-a92f-4d86-8cfb-3dcc89c43dd6.lovable.app";

    // Parse state early so we can use appOrigin for error redirects too
    let userId: string | undefined;
    let appOrigin = fallbackOrigin;
    if (stateParam) {
      try {
        const state = JSON.parse(atob(stateParam));
        userId = state.userId;
        if (state.appOrigin) appOrigin = state.appOrigin;
      } catch { /* handled below */ }
    }

    if (error) {
      return Response.redirect(
        `${appOrigin}/settings?gcal_error=${encodeURIComponent(error)}`,
        302
      );
    }

    if (!code || !stateParam) {
      return Response.redirect(
        `${appOrigin}/settings?gcal_error=missing_params`,
        302
      );
    }

    if (!userId) {
      return Response.redirect(
        `${appOrigin}/settings?gcal_error=invalid_state`,
        302
      );
    }

    const clientId = Deno.env.get("GOOGLE_CLIENT_ID")!;
    const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET")!;
    const redirectUri = `${Deno.env.get("SUPABASE_URL")}/functions/v1/google-calendar-callback`;

    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("Token exchange failed:", tokenData);
      return Response.redirect(
        `${appOrigin}/settings?gcal_error=token_exchange_failed`,
        302
      );
    }

    // Get user email from Google
    let connectedEmail: string | null = null;
    try {
      const userinfoRes = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
      );
      const userinfo = await userinfoRes.json();
      connectedEmail = userinfo.email ?? null;
    } catch {
      // non-critical
    }

    const expiresAt = tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
      : null;

    // Use service role to upsert integration row
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Delete existing google_calendar rows for this user, then insert fresh
    await supabase
      .from("integrations")
      .delete()
      .eq("user_id", userId)
      .eq("provider", "google_calendar");

    const { error: insertError } = await supabase.from("integrations").insert({
      user_id: userId,
      provider: "google_calendar",
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token ?? null,
      expires_at: expiresAt,
      connected_email: connectedEmail,
    });

    if (insertError) {
      console.error("Failed to save integration:", insertError);
      return Response.redirect(
        `${appOrigin}/settings?gcal_error=save_failed`,
        302
      );
    }

    return Response.redirect(`${appOrigin}/settings?gcal_connected=true`, 302);
  } catch (err) {
    console.error("Callback error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
});
