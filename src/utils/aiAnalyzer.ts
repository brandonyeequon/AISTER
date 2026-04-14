import { STER_COMPETENCIES, ScoreLevel } from './sterData';

export async function analyzeNotesWithGemini(observationNotes: string) {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  if (!API_KEY) {
    throw new Error("Missing VITE_GEMINI_API_KEY environment variable");
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
  
  // Create a structured prompt
  const competenciesJson = Object.values(STER_COMPETENCIES).flat().map(c => ({
    id: c.id,
    descriptor: c.descriptor,
    rubric: {
      "0": c.rubric.level0.description,
      "1": c.rubric.level1.description,
      "2": c.rubric.level2.description,
      "3": c.rubric.level3.description,
    }
  }));

  const prompt = `
You are an expert teacher evaluator. I will provide you with observation notes from a classroom observation.
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
${JSON.stringify(competenciesJson, null, 2)}

Return ONLY a valid JSON array of objects with this structure (no markdown tags, just the raw JSON):
[
  { "id": "LL1", "score": 2, "notes": "evidence from notes..." }
]
`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        response_mime_type: "application/json"
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error: ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Invalid response from Gemini API");
  }

  try {
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleanText);
    return parsed as Array<{ id: string; score: ScoreLevel; notes: string }>;
  } catch (e) {
    throw new Error("Failed to parse Gemini API response as JSON: " + text);
  }
}
