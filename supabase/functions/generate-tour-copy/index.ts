import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, region, category, duration_hours, time_type, difficulty, walking_level, best_for, stops, includes, tags } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const prompt = `Generate tour copy for a Crete tour. Keep it simple, direct, and genuine.

CRITICAL RULES:
- NO flowery language or excessive adjectives
- NO marketing fluff like "unforgettable", "breathtaking", "magical", "paradise"
- NO cheesy phrases like "hidden gem", "off the beaten path", "feast for the senses"
- NO fake excitement or over-promises
- Write like a local friend recommending a place, not a brochure
- Be factual and honest - mention what people will actually do
- Keep sentences short and punchy
- No prices, opening hours, or guarantees
- Short teaser max 120 characters
- Description max 650 characters

GOOD EXAMPLE:
"A relaxed half day around the old town. Good for photos, coffee stops, and exploring without rushing."

BAD EXAMPLE (too cheesy):
"Immerse yourself in the enchanting atmosphere of this magical destination where timeless beauty awaits around every corner."

TOUR DETAILS:
Title: ${title}
Region: ${region}
Category: ${category}
Duration: ${duration_hours} hours (${time_type})
Difficulty: ${difficulty}
Walking Level: ${walking_level}
Best For: ${best_for?.join(', ') || 'All travelers'}
Stops: ${stops?.join(', ') || 'Various locations'}
Current Includes: ${includes?.join(', ') || 'None specified'}
Tags: ${tags?.join(', ') || 'None'}

Return JSON with:
- short_teaser: string (max 120 chars, casual tone)
- description: string (max 650 chars, informative and honest)
- highlights: array of 4-6 short factual strings
- includes: array of 4-6 strings
- source_summary: string explaining what sources/knowledge was used`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a professional travel copywriter. Return valid JSON only.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON in response');
    }
    
    const result = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating tour copy:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
