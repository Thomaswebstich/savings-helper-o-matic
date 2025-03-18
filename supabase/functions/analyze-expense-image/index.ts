
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY') || '';

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
    const formData = await req.formData();
    const imageFile = formData.get('image');
    
    if (!imageFile || !(imageFile instanceof File)) {
      return new Response(
        JSON.stringify({ error: 'No image provided or invalid file' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Convert the image to base64
    const imageBytes = await imageFile.arrayBuffer();
    const base64Image = btoa(
      new Uint8Array(imageBytes).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    const base64ImageUrl = `data:${imageFile.type};base64,${base64Image}`;

    // Create the prompt for expense analysis
    const prompt = `
      This image shows a receipt or expense document. 
      Analyze it and extract the following information in a structured JSON format:
      1. The total amount spent
      2. The currency (THB, USD, EUR, or others if visible)
      3. The date of the expense (in YYYY-MM-DD format)
      4. The merchant/vendor name
      5. The expense category (food, transportation, accommodation, etc.)
      6. A short description of the expense

      Return ONLY a valid JSON object with these keys: amount, currency, date, vendor, category, description. 
      If you cannot determine a value, use null. Do not include explanations outside the JSON.
    `;

    console.log("Sending image to OpenAI for analysis...");

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: base64ImageUrl } }
            ]
          }
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', await response.text());
      throw new Error('Failed to analyze image with OpenAI');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Try to extract valid JSON from the response
    let parsedData;
    try {
      // Look for JSON in the content (handle cases where there might be text before/after JSON)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      parsedData = JSON.parse(jsonString);
      
      // Basic validation
      const requiredFields = ['amount', 'currency', 'date', 'vendor', 'category', 'description'];
      for (const field of requiredFields) {
        if (!Object.prototype.hasOwnProperty.call(parsedData, field)) {
          parsedData[field] = null; // Ensure all required fields exist
        }
      }
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error);
      throw new Error('Failed to parse the response from the AI');
    }

    return new Response(JSON.stringify({ data: parsedData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-expense-image function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
