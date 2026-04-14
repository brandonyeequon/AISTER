// Client wrapper for the `ai-analysis` Supabase Edge Function.
// The Gemini API key lives server-side as a function secret, not a VITE_ env var,
// so the browser never sees it.

import { supabase } from './supabase';
import { STER_COMPETENCIES, ScoreLevel } from './sterData';

export interface AiScore {
  id: string;
  score: ScoreLevel;
  notes: string;
}

export async function analyzeNotesWithGemini(observationNotes: string): Promise<AiScore[]> {
  const competencies = Object.values(STER_COMPETENCIES).flat().map((c) => ({
    id: c.id,
    descriptor: c.descriptor,
    rubric: {
      '0': c.rubric.level0.description,
      '1': c.rubric.level1.description,
      '2': c.rubric.level2.description,
      '3': c.rubric.level3.description,
    },
  }));

  const { data, error } = await supabase.functions.invoke('ai-analysis', {
    body: { observationNotes, competencies },
  });

  // supabase-js returns FunctionsHttpError for non-2xx responses and hides the body
  // behind a generic message. Read response.json() to surface the real server error.
  if (error) {
    let serverMessage = '';
    const response = (error as { context?: { response?: Response } }).context?.response;
    if (response) {
      try {
        const payload = await response.clone().json();
        serverMessage = payload?.error ?? JSON.stringify(payload);
      } catch {
        try {
          serverMessage = await response.clone().text();
        } catch {
          /* ignore */
        }
      }
    }
    throw new Error(serverMessage || error.message || 'AI analysis failed');
  }
  if (data?.error) {
    throw new Error(data.error);
  }
  if (!data?.results || !Array.isArray(data.results)) {
    throw new Error('AI analysis returned an invalid payload');
  }

  return data.results as AiScore[];
}
