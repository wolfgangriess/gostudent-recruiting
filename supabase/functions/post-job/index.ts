import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/**
 * Stub function for distributing a job to external boards.
 * Extend each case block with the actual board API integration.
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
    const { job_id, board } = await req.json();

    if (!job_id || !board) {
      return new Response(
        JSON.stringify({ error: "Missing job_id or board" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Stub: log the distribution request; real integrations go here
    const result: { board: string; status: string; message: string } = { board, status: "ok", message: "" };
    switch (board) {
      case "careers":
        result.message = "Job is live on GoStudent Careers (served by public-jobs function)";
        break;
      case "linkedin":
        result.message = "LinkedIn posting stub — integrate LinkedIn Job Posting API here";
        break;
      case "indeed":
        result.message = "Indeed posting stub — integrate Indeed Publisher API here";
        break;
      case "karriere":
        result.message = "karriere.at posting stub — integrate karriere.at API here";
        break;
      default:
        result.message = `Unknown board: ${board}`;
        result.status = "unknown";
    }

    console.log(`[post-job] job=${job_id} board=${board} => ${result.message}`);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
