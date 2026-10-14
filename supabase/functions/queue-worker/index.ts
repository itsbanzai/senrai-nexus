// Senrai Nexus queue worker.
// Deploy as a Supabase Edge Function named "queue-worker".
// Required function secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY, CRON_SECRET.
// Invoke with Authorization: Bearer <CRON_SECRET>. Never expose these secrets in the browser.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return reply({ error: "POST required" }, 405);
  const cronSecret = Deno.env.get("CRON_SECRET");
  const auth = req.headers.get("authorization") || "";
  if (!cronSecret || auth !== `Bearer ${cronSecret}`) return reply({ error: "Unauthorized" }, 401);

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const geminiKey = Deno.env.get("GEMINI_API_KEY");
  if (!url || !serviceKey || !geminiKey) return reply({ error: "Worker secrets are not configured" }, 500);

  const sb = createClient(url, serviceKey, { auth: { persistSession: false } });
  try {
    // Process at most one item per invocation to keep each scheduled run bounded.
    const { data: queued, error: readError } = await sb.from("nexus_tasks")
      .select("id,user_id,title,description,status")
      .eq("status", "queued").order("created_at", { ascending: true }).limit(1);
    if (readError) throw readError;
    const task = queued?.[0];
    if (!task) return reply({ ok: true, processed: false, message: "Queue empty" });

    // Conditional claim prevents two workers from intentionally claiming the same task.
    const { data: claimed, error: claimError } = await sb.from("nexus_tasks")
      .update({ status: "in_progress", updated_at: new Date().toISOString() })
      .eq("id", task.id).eq("status", "queued").select("id");
    if (claimError) throw claimError;
    if (!claimed?.length) return reply({ ok: true, processed: false, message: "Task already claimed" });

    await sb.from("nexus_activity").insert({
      user_id: task.user_id, title: "Cloud auto-run started",
      detail: `Cloud worker claimed: ${task.title}`
    });

    try {
      const prompt = [
        "You are Senrai, an assistant executing a business task.",
        "Produce a concrete, useful deliverable. Do not claim to publish content, contact customers, spend money, or access external accounts.",
        "Clearly label assumptions. Keep the result practical and ready for owner review.",
        `Task: ${task.title}`,
        `Existing details: ${task.description || "None"}`
      ].join("\n\n");
      const ai = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + encodeURIComponent(geminiKey), {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const result = await ai.json();
      if (!ai.ok) throw new Error(result?.error?.message || `Gemini request failed (${ai.status})`);
      const output = result?.candidates?.[0]?.content?.parts?.map((p: {text?: string}) => p.text || "").join("").trim();
      if (!output) throw new Error("AI returned an empty response.");

      const base = (task.description || "").split("\n\n--- SENRAI RUN ").slice(0, 1)[0]
        .split("\n\n--- SENRAI AUTO-RUN ").slice(0, 1)[0];
      const description = base + "\n\n--- SENRAI CLOUD RUN " + new Date().toISOString() + " ---\n" + output;
      const { error: saveError } = await sb.from("nexus_tasks").update({
        description, status: "completed", updated_at: new Date().toISOString()
      }).eq("id", task.id).eq("user_id", task.user_id);
      if (saveError) throw saveError;
      await sb.from("nexus_activity").insert({
        user_id: task.user_id, title: "Cloud auto-run completed",
        detail: `Saved AI output for: ${task.title}`
      });
      return reply({ ok: true, processed: true, task_id: task.id, status: "completed" });
    } catch (err) {
      const reason = String((err as Error)?.message || err).slice(0, 500);
      await sb.from("nexus_tasks").update({
        status: "queued", updated_at: new Date().toISOString()
      }).eq("id", task.id).eq("user_id", task.user_id);
      await sb.from("nexus_activity").insert({
        user_id: task.user_id, title: "Cloud auto-run failed",
        detail: `${task.title}: ${reason}. Task returned to queue for retry.`
      });
      return reply({ ok: false, processed: true, task_id: task.id, retry: true, error: reason }, 502);
    }
  } catch (err) {
    return reply({ error: String((err as Error)?.message || err) }, 500);
  }
});

function reply(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...cors, "content-type": "application/json" }
  });
}
