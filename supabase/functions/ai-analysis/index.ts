// Supabase Edge Function: AI-based STER competency scorer.
// Input : { observationNotes: string, competencies: Array<{ id, descriptor, rubric: {0,1,2,3} }> }
// Output: Array<{ id: string, score: 0|1|2|3, notes: string }>
// Secrets: GEMINI_API_KEY (set with `supabase secrets set GEMINI_API_KEY=...`)

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface CompetencyInput {
  id: string;
  descriptor: string;
  rubric: { '0': string; '1': string; '2': string; '3': string };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const observationNotes: string = body?.observationNotes ?? '';
    const competencies: CompetencyInput[] = body?.competencies ?? [];

    if (!observationNotes.trim()) {
      return jsonResponse({ error: 'observationNotes is required' }, 400);
    }
    if (!Array.isArray(competencies) || competencies.length === 0) {
      return jsonResponse({ error: 'competencies array is required' }, 400);
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      return jsonResponse({ error: 'Server is missing GEMINI_API_KEY' }, 500);
    }

    const prompt = `You are an expert teacher evaluator. I will provide you with observation notes from a classroom observation.
Based ONLY on these notes, grade the teacher on the provided STER competencies.
For each competency, assign a score (0, 1, 2, or 3).
Crucially, you must provide detailed, actionable, and high-quality "evaluator notes" for each competency. These notes should:
1. Directly quote or reference specific evidence from the observation notes. If the user gives a direct instruction like "give 0 for all", treat that as the evidence.
2. Explain exactly why the teacher received the assigned score based on the rubric.
3. Offer constructive feedback or actionable next steps for improvement (if applicable).

If the observation notes do not provide enough evidence for a competency AND there is no general instruction that applies to it, do not grade it (omit it from the response). Otherwise, grade it based on the explicit instruction or evidence provided.

Observation Notes:
"""
${observationNotes}
"""

Competencies to evaluate:
${JSON.stringify(competencies, null, 2)}

Return ONLY a valid JSON array of objects with this structure (no markdown tags, just the raw JSON):
[
  { "id": "LL1", "score": 2, "notes": "evidence from notes..." }
]`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const upstream = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: 'application/json' },
      }),
    });

    if (!upstream.ok) {
      const errorText = await upstream.text();
      return jsonResponse({ error: `Gemini API error: ${upstream.statusText} ${errorText}` }, 502);
    }

    const data = await upstream.json();
    const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return jsonResponse({ error: 'Invalid response from Gemini' }, 502);
    }

    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return jsonResponse({ error: 'Failed to parse Gemini JSON output', raw: text }, 502);
    }

    if (!Array.isArray(parsed)) {
      return jsonResponse({ error: 'Gemini output was not a JSON array', raw: text }, 502);
    }

    return jsonResponse({ results: parsed }, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return jsonResponse({ error: message }, 500);
  }
});

function jsonResponse(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
