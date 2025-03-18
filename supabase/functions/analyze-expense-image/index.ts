
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
    // Get the form data
    const formData = await req.formData();
    const imageFile = formData.get('image');
    const categoriesJson = formData.get('categories') || '[]';
    
    if (!imageFile || !(imageFile instanceof File)) {
      console.error('No image provided or invalid file type');
      return new Response(
        JSON.stringify({ error: 'No image provided or invalid file' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing image: ${imageFile.name}, type: ${imageFile.type}, size: ${imageFile.size} bytes`);
    
    // Parse the categories to help with categorization
    let categories = [];
    try {
      categories = JSON.parse(categoriesJson.toString());
      console.log(`Received ${categories.length} categories for mapping`);
    } catch (error) {
      console.error('Error parsing categories:', error);
      // Continue without categories if parsing fails
    }

    // Convert the image to base64
    const imageBytes = await imageFile.arrayBuffer();
    const base64Image = btoa(
      new Uint8Array(imageBytes).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    const base64ImageUrl = `data:${imageFile.type};base64,${base64Image}`;

    // Create the prompt for expense analysis
    let prompt = `
      This image shows a receipt or expense document. 
      Analyze it and extract the following information in a structured JSON format:
      1. The total amount spent
      2. The currency (THB, USD, EUR, or others if visible)
      3. The date of the expense (in YYYY-MM-DD format)
      4. The merchant/vendor name
      5. A short description of the expense
    `;
    
    // Add category mapping to the prompt if categories are available
    if (categories.length > 0) {
      prompt += `\n6. Assign the expense to one of these specific categories based on the merchant and items purchased:\n`;
      categories.forEach(cat => {
        prompt += `   - "${cat.name}" (ID: ${cat.id})\n`;
      });
      prompt += `\nChoose the most appropriate category ID from the list above.`;
    } else {
      prompt += `\n6. Your best guess for a general expense category (food, transportation, accommodation, etc.)`;
    }
    
    prompt += `\n\nReturn ONLY a valid JSON object with these keys: amount, currency, date, vendor, description, category
      If you cannot determine a value, use null. Do not include explanations outside the JSON.
    `;

    console.log("Sending image to OpenAI for analysis...");
    
    if (!openAIApiKey || openAIApiKey.trim() === '') {
      console.error("OpenAI API key is missing or empty");
      return new Response(
        JSON.stringify({ error: 'OpenAI API key is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`Failed to analyze image with OpenAI: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI response received:', JSON.stringify(data));
    
    const content = data.choices[0].message.content;
    console.log('Content from OpenAI:', content);
    
    // Try to extract valid JSON from the response
    let parsedData;
    try {
      // Look for JSON in the content (handle cases where there might be text before/after JSON)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      parsedData = JSON.parse(jsonString);
      
      // Basic validation
      const requiredFields = ['amount', 'currency', 'date', 'vendor', 'description', 'category'];
      for (const field of requiredFields) {
        if (!Object.prototype.hasOwnProperty.call(parsedData, field)) {
          parsedData[field] = null; // Ensure all required fields exist
        }
      }
      
      console.log('Successfully parsed data:', JSON.stringify(parsedData));
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error, 'Content was:', content);
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
