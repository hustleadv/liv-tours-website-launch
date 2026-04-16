import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml',
};

// Generate URL entry for sitemap
const urlEntry = (loc: string, lastmod: string, changefreq: string, priority: string) => `
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[SITEMAP] Generating dynamic sitemap...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const today = new Date().toISOString().split('T')[0];
    const baseUrl = 'https://livtours.gr';

    // Static main pages
    const staticPages = [
      { path: '/', priority: '1.0', changefreq: 'weekly' },
      { path: '/transfers', priority: '0.9', changefreq: 'weekly' },
      { path: '/tours', priority: '0.9', changefreq: 'weekly' },
      { path: '/tours/browse', priority: '0.85', changefreq: 'weekly' },
      { path: '/events', priority: '0.8', changefreq: 'monthly' },
      { path: '/fleet', priority: '0.8', changefreq: 'monthly' },
      { path: '/routes', priority: '0.9', changefreq: 'weekly' },
      { path: '/reviews', priority: '0.7', changefreq: 'weekly' },
      { path: '/faq', priority: '0.6', changefreq: 'monthly' },
      { path: '/contact', priority: '0.8', changefreq: 'monthly' },
      { path: '/about', priority: '0.6', changefreq: 'monthly' },
      { path: '/pricelist', priority: '0.7', changefreq: 'weekly' },
      // Legal pages
      { path: '/legal/privacy', priority: '0.3', changefreq: 'yearly' },
      { path: '/legal/cookies', priority: '0.3', changefreq: 'yearly' },
      { path: '/legal/terms', priority: '0.3', changefreq: 'yearly' },
      { path: '/legal/bookingterms', priority: '0.3', changefreq: 'yearly' },
      // Policy pages
      { path: '/policies/cancellation', priority: '0.4', changefreq: 'yearly' },
      { path: '/policies/flightdelays', priority: '0.4', changefreq: 'yearly' },
      { path: '/policies/pricing', priority: '0.4', changefreq: 'yearly' },
      { path: '/policies/payments', priority: '0.4', changefreq: 'yearly' },
      { path: '/sitemap', priority: '0.3', changefreq: 'monthly' },
    ];

    // Fetch published tours
    console.log('[SITEMAP] Fetching published tours...');
    const { data: tours, error: toursError } = await supabase
      .from('tours')
      .select('slug, updated_at, popular_score')
      .eq('status', 'published')
      .order('popular_score', { ascending: false });

    if (toursError) {
      console.error('[SITEMAP] Error fetching tours:', toursError);
      throw toursError;
    }
    console.log(`[SITEMAP] Found ${tours?.length || 0} published tours`);

    // Fetch unique routes from fixed_prices
    console.log('[SITEMAP] Fetching routes from fixed_prices...');
    const { data: routes, error: routesError } = await supabase
      .from('fixed_prices')
      .select('pickup_zone, dropoff_name')
      .order('pickup_zone');

    if (routesError) {
      console.error('[SITEMAP] Error fetching routes:', routesError);
      throw routesError;
    }

    // Create unique route combinations
    const uniqueRoutes = new Map<string, { from: string; to: string }>();
    routes?.forEach((route) => {
      const routeId = `${route.pickup_zone.toLowerCase().replace(/\s+/g, '-')}-to-${route.dropoff_name.toLowerCase().replace(/\s+/g, '-')}`;
      if (!uniqueRoutes.has(routeId)) {
        uniqueRoutes.set(routeId, { from: route.pickup_zone, to: route.dropoff_name });
      }
    });
    console.log(`[SITEMAP] Found ${uniqueRoutes.size} unique routes`);

    // Build sitemap XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add static pages
    staticPages.forEach((page) => {
      sitemap += urlEntry(
        `${baseUrl}${page.path}`,
        today,
        page.changefreq,
        page.priority
      );
    });

    // Add tour pages
    tours?.forEach((tour) => {
      const lastmod = tour.updated_at ? tour.updated_at.split('T')[0] : today;
      // Higher priority for popular tours
      const priority = (tour.popular_score || 0) >= 80 ? '0.9' : 
                       (tour.popular_score || 0) >= 50 ? '0.85' : '0.8';
      sitemap += urlEntry(
        `${baseUrl}/tours/${tour.slug}`,
        lastmod,
        'monthly',
        priority
      );
    });

    // Add route pages
    uniqueRoutes.forEach((route, routeId) => {
      // Higher priority for airport routes
      const isAirport = route.from.toLowerCase().includes('airport');
      const priority = isAirport ? '0.85' : '0.8';
      sitemap += urlEntry(
        `${baseUrl}/routes/${routeId}`,
        today,
        'monthly',
        priority
      );
    });

    sitemap += `
</urlset>`;

    console.log(`[SITEMAP] Generated sitemap with ${staticPages.length + (tours?.length || 0) + uniqueRoutes.size} URLs`);

    return new Response(sitemap, {
      headers: corsHeaders,
      status: 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[SITEMAP] Error generating sitemap:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
