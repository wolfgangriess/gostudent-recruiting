import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SendEmailParams {
  to: string;
  subject: string;
  /** HTML or plain-text body */
  body: string;
}

/** Build a base64url-encoded RFC 2822 message for the Gmail API */
function makeRaw(to: string, from: string, subject: string, body: string): string {
  const msg = [
    `To: ${to}`,
    `From: ${from}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=utf-8`,
    ``,
    body,
  ].join("\r\n");

  // btoa works on latin1; use encodeURIComponent + unescape to handle UTF-8
  return btoa(unescape(encodeURIComponent(msg)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Send an email via the Gmail API using the signed-in user's Google provider token.
 *
 * NOTE: Requires the user to have signed in with the gmail.send scope
 * (requested in LoginPage.tsx via GOOGLE_SCOPES). If provider_token is absent
 * (e.g. session refreshed without re-auth), the mutation will throw.
 */
export const useSendEmail = () =>
  useMutation({
    mutationFn: async ({ to, subject, body }: SendEmailParams) => {
      const { data: sessionData } = await supabase.auth.getSession();
      const providerToken = sessionData.session?.provider_token;
      if (!providerToken) {
        throw new Error(
          "No Google provider token — sign in via GoStudent SSO or Google to send emails."
        );
      }
      const from = sessionData.session?.user?.email ?? "";
      const raw = makeRaw(to, from, subject, body);

      const res = await fetch(
        "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${providerToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ raw }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          (err as { error?: { message?: string } })?.error?.message ??
            "Failed to send email via Gmail"
        );
      }

      return res.json() as Promise<{ id: string; threadId: string }>;
    },
  });
