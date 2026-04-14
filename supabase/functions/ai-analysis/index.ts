import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { evaluationData } = await req.json();

    if (!evaluationData) {
      throw new Error('evaluationData is required');
    }

    // You will need to add GEMINI_API_KEY to your Supabase Edge Function secrets
    // e.g. supabase secrets set GEMINI_API_KEY=your_api_key
    const apiKey = Deno.env.get('GEMINI_API_KEY');

    if (!apiKey) {
      throw new Error('Missing Gemini API key');
    }

    const prompt = `You are an expert educational evaluator. Based on the provided classroom observation data, provide a concise, constructive, and actionable summary of the teacher's performance, highlighting strengths and areas for improvement.

Please analyze this observation data:
${JSON.stringify(evaluationData, null, 2)}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
        }
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to generate content');
    }

    const feedback = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!feedback) {
      throw new Error('No feedback generated');
    }

    return new Response(
      JSON.stringify({ feedback }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});
