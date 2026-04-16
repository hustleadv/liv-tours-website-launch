import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Search Wikipedia for best matching title
async function searchWikipedia(query: string): Promise<string[]> {
  const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&srlimit=3`;
  
  try {
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'LIVTransfers/1.0 (https://livtransfers.com; contact@livtransfers.com)',
      },
    });
    
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.query?.search?.map((r: any) => r.title) || [];
  } catch (error) {
    console.error('Wikipedia search error:', error);
    return [];
  }
}

// Get Wikipedia summary for a title
async function getWikipediaSummary(title: string): Promise<{ extract: string; url: string } | null> {
  const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  
  try {
    const response = await fetch(summaryUrl, {
      headers: {
        'User-Agent': 'LIVTransfers/1.0 (https://livtransfers.com; contact@livtransfers.com)',
      },
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (data.type === 'disambiguation') return null;
    
    return {
      extract: data.extract || '',
      url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
    };
  } catch (error) {
    console.error('Wikipedia summary error:', error);
    return null;
  }
}

// Generate fun fact using Lovable AI
async function generateFunFact(extract: string, stopName: string): Promise<string | null> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  
  if (!LOVABLE_API_KEY) {
    console.error('LOVABLE_API_KEY not configured');
    return null;
  }
  
  const prompt = `Based on this Wikipedia extract about ${stopName}, write a fun fact:

"${extract}"

Rules:
- 1-2 sentences maximum
- Maximum 200 characters
- No prices or costs
- No opening hours
- No guarantees or promises
- No sensational claims like "best" or "most amazing"
- Focus on interesting historical, cultural, or natural facts
- Output in English

Write only the fun fact, nothing else.`;

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
          { role: 'system', content: 'You are a concise travel fact writer. Write only the requested content, no explanations.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    let funFact = data.choices?.[0]?.message?.content?.trim() || null;
    
    // Ensure max 200 characters
    if (funFact && funFact.length > 200) {
      funFact = funFact.substring(0, 197) + '...';
    }
    
    return funFact;
  } catch (error) {
    console.error('Lovable AI generation error:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all published tours
    const { data: tours, error: toursError } = await supabase
      .from('tours')
      .select('slug, title, stops')
      .eq('status', 'published');

    if (toursError) {
      throw new Error(`Failed to fetch tours: ${toursError.message}`);
    }

    console.log(`Found ${tours?.length || 0} published tours`);

    const results: { slug: string; success: boolean; funFact?: string; error?: string }[] = [];

    for (const tour of tours || []) {
      // Extract main destination from tour title (not just longest stop)
      const stops = tour.stops as any[];
      
      const getMainDestinationFromTitle = (title: string, tourStops: any[]) => {
        // Extract main destination from title (before "and", "Tour", "&", etc.)
        const cleanTitle = title
          .replace(/\s+(Tour|Day Trip|Excursion|Experience|Adventure|Highlights|Day)$/i, '')
          .replace(/\s+and\s+.*/i, '')
          .replace(/\s+&\s+.*/i, '')
          .replace(/\s+-\s+.*/i, '')
          .trim();
        
        // Try to find a matching stop that contains the clean title
        const matchingStop = tourStops.find(stop => {
          const stopName = stop.name.toLowerCase();
          const titleLower = cleanTitle.toLowerCase();
          return titleLower.includes(stopName) || stopName.includes(titleLower);
        });
        
        if (matchingStop) return matchingStop.name;
        
        // If no stop matches, use the cleaned title directly for Wikipedia search
        // This handles cases where stops have generic names like "Cove time"
        return cleanTitle;
      };

      const primaryStopName = getMainDestinationFromTitle(tour.title, stops || []);

      if (!primaryStopName) {
        results.push({ slug: tour.slug, success: false, error: 'No destination found' });
        continue;
      }

      // Check if already cached
      const { data: existing } = await supabase
        .from('tour_fun_facts')
        .select('fun_fact_text')
        .eq('tour_slug', tour.slug)
        .maybeSingle();

      if (existing?.fun_fact_text) {
        console.log(`Skipping ${tour.slug} - already has fun fact`);
        results.push({ slug: tour.slug, success: true, funFact: existing.fun_fact_text });
        continue;
      }

      console.log(`Generating fun fact for: ${tour.slug} (${primaryStopName})`);

      // Search Wikipedia with location context
      const searchQueries = [
        `${primaryStopName} Crete`,
        `${primaryStopName} Greece`,
        primaryStopName,
      ];

      let wikiData: { extract: string; url: string } | null = null;

      for (const query of searchQueries) {
        const titles = await searchWikipedia(query);
        
        for (const title of titles) {
          wikiData = await getWikipediaSummary(title);
          if (wikiData && wikiData.extract.length > 100) {
            console.log(`Found Wikipedia article: ${title}`);
            break;
          }
        }
        
        if (wikiData) break;
      }

      if (!wikiData) {
        results.push({ slug: tour.slug, success: false, error: 'No Wikipedia data found' });
        continue;
      }

      // Generate fun fact with Lovable AI
      const funFact = await generateFunFact(wikiData.extract, primaryStopName);

      if (!funFact) {
        results.push({ slug: tour.slug, success: false, error: 'Failed to generate fun fact' });
        continue;
      }

      // Cache the result
      const { error: upsertError } = await supabase
        .from('tour_fun_facts')
        .upsert({
          tour_slug: tour.slug,
          primary_stop_name: primaryStopName,
          fun_fact_text: funFact,
          fun_fact_source_url: wikiData.url,
          fun_fact_last_generated_at: new Date().toISOString(),
        }, { onConflict: 'tour_slug' });

      if (upsertError) {
        console.error('Cache upsert error:', upsertError);
        results.push({ slug: tour.slug, success: false, error: upsertError.message });
        continue;
      }

      results.push({ slug: tour.slug, success: true, funFact });
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log(`Completed: ${successCount} success, ${failCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Generated fun facts for ${successCount} tours, ${failCount} failed`,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Prefill error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});