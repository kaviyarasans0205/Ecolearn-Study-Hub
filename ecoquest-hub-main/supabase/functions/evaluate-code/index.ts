import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, language, challengeTitle, challengeDescription, difficulty, maxXp } = await req.json();

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

    const systemPrompt = `You are a strict but fair code review assistant for an educational platform. Evaluate student code submissions on Correctness, Code Quality, Completeness, Efficiency, and Best Practices. Always return structured output via the tool call.`;

    const userPrompt = `**Challenge:** ${challengeTitle}
**Description:** ${challengeDescription}
**Difficulty:** ${difficulty}
**Language:** ${language}
**Max XP:** ${maxXp}

**Student Code:**
\`\`\`${language}
${code}
\`\`\`

Score each of the 5 criteria out of 20 (total 100). xpEarned = round(score/100 * ${maxXp}). passed = score >= 60.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_evaluation",
            description: "Return code evaluation result",
            parameters: {
              type: "object",
              properties: {
                score: { type: "number" },
                maxScore: { type: "number" },
                passed: { type: "boolean" },
                summary: { type: "string" },
                strengths: { type: "array", items: { type: "string" } },
                improvements: { type: "array", items: { type: "string" } },
                xpEarned: { type: "number" },
              },
              required: ["score", "maxScore", "passed", "summary", "strengths", "improvements", "xpEarned"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "return_evaluation" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const errText = await response.text();
      console.error("AI error:", status, errText);
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Lovable Cloud." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI API error: ${status}`);
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("AI did not return structured evaluation");

    const feedback = JSON.parse(toolCall.function.arguments);
    // Safety clamps
    feedback.maxScore = 100;
    feedback.score = Math.max(0, Math.min(100, Number(feedback.score) || 0));
    feedback.xpEarned = Math.max(0, Math.round((feedback.score / 100) * (Number(maxXp) || 0)));
    feedback.passed = feedback.score >= 60;

    return new Response(JSON.stringify(feedback), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Evaluation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Evaluation failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
