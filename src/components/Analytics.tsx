import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const Analytics = () => {
  const { data: settings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings' as any)
        .select('google_analytics_id')
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching analytics ID:', error);
        return null;
      }
      return data as any;
    },
    staleTime: Infinity, // Settings don't change often
  });

  useEffect(() => {
    const gaId = settings?.google_analytics_id;
    if (!gaId || typeof window === 'undefined') return;

    // Direct script injection for GA4
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    
    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaId}', {
        page_path: window.location.pathname,
      });
    `;

    document.head.appendChild(script1);
    document.head.appendChild(script2);

    return () => {
      // Cleanup cleanup (optional, but keep it clean)
      if (document.head.contains(script1)) document.head.removeChild(script1);
      if (document.head.contains(script2)) document.head.removeChild(script2);
    };
  }, [settings]);

  return null;
};

export default Analytics;
