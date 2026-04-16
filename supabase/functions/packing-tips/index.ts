import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WeatherData {
  location: string;
  date: string;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
  precipitationProbability: number;
  windSpeed: number;
}

interface RequestBody {
  weather: WeatherData;
  language?: 'en' | 'gr';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { weather, language = 'en' } = await req.json() as RequestBody;
    
    if (!weather) {
      return new Response(
        JSON.stringify({ error: "Weather data is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const weatherDescription = getWeatherDescription(weather.weatherCode);
    
    const languageInstruction = language === 'gr' 
      ? 'IMPORTANT: Write ALL tips in Greek language (Ελληνικά). Use natural, conversational Greek.'
      : 'Write all tips in English.';
    
    const prompt = `Weather for ${weather.location}, Crete on ${weather.date}:
- Temp: ${weather.tempMin}°C to ${weather.tempMax}°C
- Weather: ${weatherDescription}
- Rain: ${weather.precipitationProbability}%
- Wind: ${weather.windSpeed} km/h

${languageInstruction}

Give VERY SHORT packing tips (3-5 words each, like a quick checklist). One tip per category.

Categories: clothing, footwear, accessories, swimming, protection, essentials

Example format: "Light cotton shirt" or "Sunscreen SPF 50"`;


    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: "You are a helpful travel assistant specializing in packing advice for Mediterranean destinations. Always respond with valid JSON only, no markdown." 
          },
          { role: "user", content: prompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "provide_packing_tips",
              description: "Return categorized packing tips for the traveler",
              parameters: {
                type: "object",
                properties: {
                  tips: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        category: { 
                          type: "string", 
                          enum: ["clothing", "footwear", "accessories", "swimming", "protection", "essentials"],
                          description: "Category of the packing tip" 
                        },
                        tip: { type: "string", description: "The packing tip" },
                        icon: { type: "string", description: "Single emoji representing the tip" }
                      },
                      required: ["category", "tip", "icon"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["tips"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "provide_packing_tips" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    
    // Extract structured response from tool call
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      return new Response(
        JSON.stringify({ tips: parsed.tips }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fallback to content parsing
    const content = data.choices?.[0]?.message?.content || "";
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const tips = JSON.parse(jsonMatch[0]);
      return new Response(
        JSON.stringify({ tips }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error("Could not parse AI response");
  } catch (error) {
    console.error("packing-tips error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getWeatherDescription(code: number): string {
  const descriptions: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Slight showers",
    81: "Moderate showers",
    82: "Violent showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Thunderstorm with heavy hail",
  };
  return descriptions[code] || "Variable conditions";
}