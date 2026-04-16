import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tourSlug, tourTitle, stops, region, category, highlights } = await req.json();

    if (!tourSlug || !tourTitle) {
      return new Response(
        JSON.stringify({ error: 'Tour slug and title are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build context about the tour
    const stopsInfo = stops?.map((s: any) => s.name).join(", ") || "";
    const highlightsInfo = highlights?.join(", ") || "";

    const prompt = `You are a travel writer creating evocative, emotional descriptions for tour destinations in Crete, Greece.

Write a compelling 3-4 paragraph description for this tour that:
- Paints vivid imagery that makes readers feel they're already there
- Evokes emotions and wanderlust
- Mentions specific sensory details (colors, sounds, textures, scents)
- Highlights what makes this destination unique and special
- Feels authentic, not generic or AI-generated
- Is written in a warm, inviting tone
- Uses **bold text** to highlight the most important and evocative phrases (2-3 per paragraph)

Tour: "${tourTitle}"
Region: ${region || "Crete"}
Category: ${category || "Day Trip"}
Stops: ${stopsInfo}
Highlights: ${highlightsInfo}

Important:
- Write in English
- Focus on the main destination, not logistics
- Include local color and authentic Cretan atmosphere
- Make readers dream about visiting
- Keep it between 300-400 words
- Do NOT include any headings, just flowing paragraphs
- Use **bold** for key phrases like destination names, unique experiences, or sensory descriptions`;

    console.log(`Generating description for tour: ${tourTitle}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an expert travel writer specializing in Mediterranean destinations. Your writing is evocative, sensory, and emotionally engaging." },
          { role: "user", content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later" }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const description = data.choices?.[0]?.message?.content?.trim();

    if (!description) {
      console.error("No description generated");
      return new Response(
        JSON.stringify({ error: "Failed to generate description" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully generated description for: ${tourTitle}`);

    // Optionally update the tour in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Store the AI-generated description in source_summary field for caching
      await supabase
        .from('tours')
        .update({ source_summary: description })
        .eq('slug', tourSlug);
        
      console.log(`Cached description for: ${tourSlug}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        description,
        cached: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error generating tour description:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
