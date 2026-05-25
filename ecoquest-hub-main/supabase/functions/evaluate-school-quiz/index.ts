import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { type, prompt, questions, classLevel, subject, topic } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    if (type === "generate_mcq") {
      const systemPrompt = `You are a Tamil Nadu State Board exam question generator. Generate exactly 10 MCQ questions.
Return ONLY valid JSON array with this structure:
[{"question":"...","options":["A","B","C","D"],"correct":0,"explanation":"..."}]
correct is the 0-based index of the right answer. Make questions appropriate for the class level. Include a mix of easy, medium, and hard questions.`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "system", content: systemPrompt }, { role: "user", content: prompt }],
          tools: [{
            type: "function",
            function: {
              name: "return_questions",
              description: "Return generated MCQ questions",
              parameters: {
                type: "object",
                properties: {
                  questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        question: { type: "string" },
                        options: { type: "array", items: { type: "string" } },
                        correct: { type: "number" },
                        explanation: { type: "string" },
                      },
                      required: ["question", "options", "correct", "explanation"],
                    },
                  },
                },
                required: ["questions"],
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "return_questions" } },
        }),
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (status === 402) return new Response(JSON.stringify({ error: "Credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        throw new Error(`AI error: ${status}`);
      }

      const data = await response.json();
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      const parsed = JSON.parse(toolCall.function.arguments);

      return new Response(JSON.stringify({ questions: parsed.questions }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type === "evaluate_answers") {
      const systemPrompt = `You are a TN State Board ${classLevel} ${subject} exam evaluator. Evaluate each student answer strictly but fairly. Consider the class level when grading.`;

      const userPrompt = questions.map((q: any, i: number) =>
        `Question ${i + 1} (${q.maxMarks} marks, ${q.type} answer): ${q.question}\nStudent Answer: ${q.answer}`
      ).join("\n\n");

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
          tools: [{
            type: "function",
            function: {
              name: "return_evaluation",
              description: "Return evaluation results for each answer",
              parameters: {
                type: "object",
                properties: {
                  results: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        questionIndex: { type: "number" },
                        marksAwarded: { type: "number" },
                        maxMarks: { type: "number" },
                        feedback: { type: "string" },
                      },
                      required: ["questionIndex", "marksAwarded", "maxMarks", "feedback"],
                    },
                  },
                },
                required: ["results"],
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "return_evaluation" } },
        }),
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (status === 402) return new Response(JSON.stringify({ error: "Credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        throw new Error(`AI error: ${status}`);
      }

      const data = await response.json();
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      const parsed = JSON.parse(toolCall.function.arguments);

      return new Response(JSON.stringify({ results: parsed.results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid type" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
