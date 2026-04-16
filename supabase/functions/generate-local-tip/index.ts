import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fallback tips by location type
const FALLBACK_TIPS: Record<string, string> = {
  beach: "Go early morning for calmer waters and fewer crowds. Bring water and reef shoes.",
  airport: "Keep WhatsApp notifications on for real-time pickup updates from your driver.",
  port: "Ferries can be delayed—your driver monitors schedules and adjusts automatically.",
  city: "Best explored on foot. Wear comfortable shoes and explore the back streets.",
  resort: "Book dinner reservations early in peak season, especially beachfront spots.",
  attraction: "Visit early morning or late afternoon to avoid tour bus crowds.",
  general: "Ask your driver for their favorite local spot—they know the hidden gems.",
};

// Fetch OSM data for a location
async function fetchOSMData(lat: number, lon: number, radius: number = 500): Promise<string> {
  try {
    const query = `
      [out:json][timeout:10];
      (
        node(around:${radius},${lat},${lon})["tourism"];
        node(around:${radius},${lat},${lon})["natural"];
        node(around:${radius},${lat},${lon})["amenity"];
        way(around:${radius},${lat},${lon})["natural"="beach"];
        way(around:${radius},${lat},${lon})["tourism"];
      );
      out tags 10;
    `;
    
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    
    if (!response.ok) {
      console.log('OSM API error:', response.status);
      return '';
    }
    
    const data = await response.json();
    const elements = data.elements || [];
    
    // Extract relevant tags
    const tags: string[] = [];
    for (const el of elements.slice(0, 5)) {
      if (el.tags) {
        if (el.tags.name) tags.push(`name:${el.tags.name}`);
        if (el.tags.natural) tags.push(`natural:${el.tags.natural}`);
        if (el.tags.tourism) tags.push(`tourism:${el.tags.tourism}`);
        if (el.tags.surface) tags.push(`surface:${el.tags.surface}`);
        if (el.tags.access) tags.push(`access:${el.tags.access}`);
      }
    }
    
    return tags.join(', ');
  } catch (error) {
    console.error('OSM fetch error:', error);
    return '';
  }
}

// Fetch Wikipedia summary
async function fetchWikipediaSummary(placeName: string): Promise<string> {
  try {
    const searchQuery = `${placeName} Crete`;
    const searchUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchQuery)}`;
    
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      // Try without "Crete"
      const fallbackUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(placeName)}`;
      const fallbackResponse = await fetch(fallbackUrl);
      
      if (!fallbackResponse.ok) return '';
      
      const data = await fallbackResponse.json();
      return data.extract?.slice(0, 300) || '';
    }
    
    const data = await response.json();
    return data.extract?.slice(0, 300) || '';
  } catch (error) {
    console.error('Wikipedia fetch error:', error);
    return '';
  }
}

// Generate tip using Lovable AI
async function generateTipWithAI(
  locationName: string,
  locationType: string,
  sourceSummary: string
): Promise<{ tip: string; confidence: number }> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  
  if (!LOVABLE_API_KEY) {
    console.error('LOVABLE_API_KEY not configured');
    return { tip: FALLBACK_TIPS[locationType] || FALLBACK_TIPS.general, confidence: 0.3 };
  }
  
  const systemPrompt = `You are a local Crete travel expert. Generate ONE concise tip for travelers visiting a location.

Rules:
- Maximum 120 characters
- No prices, opening hours, or specific dates
- Focus on: timing, access, what to bring, weather, practical advice
- Use natural, friendly tone
- Be specific to the location when possible
- Safe, evergreen advice only`;

  const userPrompt = `Location: ${locationName}
Type: ${locationType}
Context: ${sourceSummary || 'No additional context available'}

Generate one short, practical tip for visitors.`;

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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      return { tip: FALLBACK_TIPS[locationType] || FALLBACK_TIPS.general, confidence: 0.3 };
    }

    const data = await response.json();
    const generatedTip = data.choices?.[0]?.message?.content?.trim();

    if (generatedTip && generatedTip.length <= 150) {
      // Truncate if needed
      const finalTip = generatedTip.length > 120 
        ? generatedTip.slice(0, 117) + '...'
        : generatedTip;
      
      const confidence = sourceSummary ? 0.8 : 0.6;
      return { tip: finalTip, confidence };
    }

    return { tip: FALLBACK_TIPS[locationType] || FALLBACK_TIPS.general, confidence: 0.4 };
  } catch (error) {
    console.error('AI generation error:', error);
    return { tip: FALLBACK_TIPS[locationType] || FALLBACK_TIPS.general, confidence: 0.3 };
  }
}

// Generate alternative tips for admin
async function generateAlternatives(
  locationName: string,
  locationType: string,
  sourceSummary: string
): Promise<string[]> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  
  if (!LOVABLE_API_KEY) {
    return [FALLBACK_TIPS[locationType] || FALLBACK_TIPS.general];
  }
  
  const systemPrompt = `You are a local Crete travel expert. Generate 3 different tip options.

Rules:
- Each tip maximum 120 characters
- No prices, opening hours, or specific dates
- Focus on: timing, access, what to bring, weather, practical advice
- Each tip should have a different angle/focus
- Return as JSON array of strings`;

  const userPrompt = `Location: ${locationName}
Type: ${locationType}
Context: ${sourceSummary || 'No additional context available'}

Generate 3 different short tips. Return as JSON array: ["tip1", "tip2", "tip3"]`;

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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      return [FALLBACK_TIPS[locationType] || FALLBACK_TIPS.general];
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    
    // Try to parse JSON array
    const match = content?.match(/\[[\s\S]*\]/);
    if (match) {
      const alternatives = JSON.parse(match[0]);
      if (Array.isArray(alternatives)) {
        return alternatives.slice(0, 3).map((t: string) => 
          t.length > 120 ? t.slice(0, 117) + '...' : t
        );
      }
    }
    
    return [FALLBACK_TIPS[locationType] || FALLBACK_TIPS.general];
  } catch (error) {
    console.error('Alternatives generation error:', error);
    return [FALLBACK_TIPS[locationType] || FALLBACK_TIPS.general];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      locationId, 
      locationName, 
      lat, 
      lon, 
      locationType = 'general',
      action = 'generate' // 'generate' | 'alternatives'
    } = await req.json();

    console.log(`Processing ${action} for location: ${locationName} (${locationType})`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if we already have a cached tip (less than 30 days old)
    if (action === 'generate') {
      const { data: existingTip } = await supabase
        .from('location_tips')
        .select('*')
        .eq('location_id', locationId)
        .single();

      if (existingTip) {
        // If manual override exists, always return it
        if (existingTip.is_manual_override && existingTip.manual_tip) {
          console.log('Returning manual override tip');
          return new Response(JSON.stringify({
            success: true,
            tip: existingTip.manual_tip,
            source: 'manual',
            confidence: 1.0,
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Check if cache is still valid (30 days)
        const lastUpdated = existingTip.last_updated 
          ? new Date(existingTip.last_updated) 
          : null;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        if (lastUpdated && lastUpdated > thirtyDaysAgo && existingTip.tip_text) {
          console.log('Returning cached tip');
          return new Response(JSON.stringify({
            success: true,
            tip: existingTip.tip_text,
            source: 'cached',
            confidence: existingTip.confidence,
            sourceSummary: existingTip.source_summary,
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
    }

    // Fetch source data
    let sourceSummary = '';
    
    if (lat && lon) {
      console.log(`Fetching OSM data for ${lat}, ${lon}`);
      const osmData = await fetchOSMData(lat, lon);
      if (osmData) {
        sourceSummary += `OSM: ${osmData}. `;
      }
    }

    console.log(`Fetching Wikipedia for ${locationName}`);
    const wikiData = await fetchWikipediaSummary(locationName);
    if (wikiData) {
      sourceSummary += `Wiki: ${wikiData}`;
    }

    console.log('Source summary:', sourceSummary.slice(0, 200));

    // Handle alternatives request (for admin)
    if (action === 'alternatives') {
      const alternatives = await generateAlternatives(locationName, locationType, sourceSummary);
      
      return new Response(JSON.stringify({
        success: true,
        alternatives,
        sourceSummary,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate tip
    const { tip, confidence } = await generateTipWithAI(locationName, locationType, sourceSummary);

    // Upsert to database
    const { error: upsertError } = await supabase
      .from('location_tips')
      .upsert({
        location_id: locationId,
        location_name: locationName,
        lat,
        lon,
        location_type: locationType,
        tip_text: tip,
        source_summary: sourceSummary || null,
        confidence,
        status: confidence >= 0.6 ? 'generated' : 'fallback',
        last_updated: new Date().toISOString(),
        last_generation_attempt: new Date().toISOString(),
      }, {
        onConflict: 'location_id',
      });

    if (upsertError) {
      console.error('Upsert error:', upsertError);
    }

    return new Response(JSON.stringify({
      success: true,
      tip,
      source: confidence >= 0.6 ? 'generated' : 'fallback',
      confidence,
      sourceSummary,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-local-tip:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      tip: FALLBACK_TIPS.general,
      source: 'error_fallback',
      confidence: 0.2,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
