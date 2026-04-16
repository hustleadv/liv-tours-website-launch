import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error('Supabase not configured');

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get all published tours
    const { data: tours, error: fetchError } = await supabase
      .from('tours')
      .select('*')
      .eq('status', 'published');

    if (fetchError) throw fetchError;

    const results = [];

    for (const tour of tours) {
      console.log(`Regenerating: ${tour.title}`);
      
      const stopNames = (tour.stops || []).map((s: any) => s.name).filter(Boolean);
      
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
Title: ${tour.title}
Region: ${tour.region}
Category: ${tour.category}
Duration: ${tour.duration_hours} hours (${tour.time_type})
Difficulty: ${tour.difficulty}
Walking Level: ${tour.walking_level}
Best For: ${tour.best_for?.join(', ') || 'All travelers'}
Stops: ${stopNames.join(', ') || 'Various locations'}
Current Includes: ${tour.includes?.join(', ') || 'None specified'}
Tags: ${tour.tags?.join(', ') || 'None'}

Return JSON with:
- short_teaser: string (max 120 chars, casual tone)
- description: string (max 650 chars, informative and honest)`;

      try {
        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: 'You are a travel copywriter. Be casual and honest, not salesy. Return valid JSON only.' },
              { role: 'user', content: prompt }
            ],
          }),
        });

        if (!response.ok) {
          console.error(`AI error for ${tour.title}: ${response.status}`);
          results.push({ slug: tour.slug, status: 'error', error: `AI error: ${response.status}` });
          continue;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';
        
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.error(`No JSON for ${tour.title}`);
          results.push({ slug: tour.slug, status: 'error', error: 'No JSON in response' });
          continue;
        }
        
        const result = JSON.parse(jsonMatch[0]);

        // Update the tour
        const { error: updateError } = await supabase
          .from('tours')
          .update({
            short_teaser: result.short_teaser?.slice(0, 120),
            description: result.description?.slice(0, 650),
          })
          .eq('id', tour.id);

        if (updateError) {
          console.error(`Update error for ${tour.title}: ${updateError.message}`);
          results.push({ slug: tour.slug, status: 'error', error: updateError.message });
        } else {
          console.log(`Updated: ${tour.title}`);
          results.push({ 
            slug: tour.slug, 
            status: 'success',
            short_teaser: result.short_teaser,
            description: result.description 
          });
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (tourError: any) {
        console.error(`Error processing ${tour.title}: ${tourError.message}`);
        results.push({ slug: tour.slug, status: 'error', error: tourError.message });
      }
    }

    return new Response(JSON.stringify({ 
      total: tours.length,
      success: results.filter(r => r.status === 'success').length,
      errors: results.filter(r => r.status === 'error').length,
      results 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error regenerating descriptions:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
