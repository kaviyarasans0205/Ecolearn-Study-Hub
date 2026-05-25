import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { code, language, testCases } = await req.json();
    if (!Array.isArray(testCases) || testCases.length === 0) {
      return new Response(JSON.stringify({ results: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

    const systemPrompt = `You simulate code execution precisely. Given source code and a stdin input, predict the EXACT stdout the program would produce. Trim trailing whitespace. If the code has a syntax/runtime error, set error to a brief message and output to "".`;

    const userPrompt = `Language: ${language}
Code:
\`\`\`${language}
${code}
\`\`\`

Run the program for each of the following stdin inputs and return the exact stdout for each.

Inputs (JSON array):
${JSON.stringify(testCases.map((t: any) => t.input ?? ""))}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_outputs",
            description: "Return predicted stdout per input",
            parameters: {
              type: "object",
              properties: {
                outputs: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      output: { type: "string" },
                      error: { type: "string" },
                    },
                    required: ["output"],
                  },
                },
              },
              required: ["outputs"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "return_outputs" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const errText = await response.text();
      console.error("AI error:", status, errText);
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limited, try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI API error: ${status}`);
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("AI did not return outputs");
    const parsed = JSON.parse(toolCall.function.arguments);

    const norm = (s: string) => (s ?? "").replace(/\r\n/g, "\n").replace(/[ \t]+\n/g, "\n").replace(/\s+$/g, "");

    const results = testCases.map((tc: any, i: number) => {
      const predicted = parsed.outputs?.[i]?.output ?? "";
      const error = parsed.outputs?.[i]?.error ?? "";
      const expected = tc.output ?? "";
      const passed = !error && norm(predicted) === norm(expected);
      return { input: tc.input ?? "", expected, actual: predicted, error, passed };
    });

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("run-test-cases error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
