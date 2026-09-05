import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_MODEL = "gemini-1.5-flash"; // Fast, reasoning-capable, and available on free tier

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!GEMINI_API_KEY) {
      throw new Error("Missing GEMINI_API_KEY secret");
    }

    const { messages, context } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid messages format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Authenticate the user from the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build the system prompt using the provided context
    const systemPrompt = `You are the "GYMTrack AI Coach", an intelligent, premium personal fitness assistant.
You are helping a user with their fitness goals based on their GYMTrack data.

CRITICAL RULES:
1. Be concise but insightful. Avoid generic motivational filler.
2. Use the user's actual GYMTrack data to inform your responses. Never fabricate statistics, personal records, or workout history.
3. If the user asks about their progress, refer to the provided context. If data is insufficient, say: "I don't have enough workout history yet to reliably assess your progress."
4. Do NOT make medical diagnoses, prescribe medication, or give strict medical advice. For pain/injury say: "Persistent or significant pain is something you should discuss with a qualified healthcare professional."
5. Do NOT recommend dangerous extreme diets or exercise through pain.
6. When recommending a workout, try to select exercises that make sense based on the user's goals and history. Use the propose_workout function if the user explicitly asks you to generate or create a workout.
7. Output formats: Format your responses easily with headings, bullets, or short paragraphs. 

USER CONTEXT:
${JSON.stringify(context, null, 2)}`;

    // Prepare Gemini messages (map 'assistant' to 'model')
    const geminiMessages = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // Define the tool for structured output
    const tools = [
      {
        functionDeclarations: [
          {
            name: "propose_workout",
            description: "Propose a structured workout plan that the user can save.",
            parameters: {
              type: "object",
              properties: {
                name: { type: "string", description: "Name of the workout, e.g. Push Day" },
                description: { type: "string", description: "Short description of the goal of this workout" },
                exercises: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      exercise_name: { type: "string", description: "Name of the exercise (e.g. Barbell Bench Press). Must match existing Exercise Library." },
                      sets: { type: "integer", description: "Number of sets" },
                      reps: { type: "string", description: "Rep range, e.g. '8-10'" },
                      rest_seconds: { type: "integer", description: "Rest time in seconds" },
                      notes: { type: "string", description: "Optional coaching cues for this exercise" },
                    },
                    required: ["exercise_name", "sets", "reps", "rest_seconds"],
                  },
                },
              },
              required: ["name", "description", "exercises"],
            },
          }
        ]
      },
    ];

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: geminiMessages,
        tools: tools,
        generationConfig: {
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Gemini API error:", errorData);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Parse Gemini response
    let replyContent = "";
    let structuredData = null;

    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];
      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if (part.text) {
            replyContent += part.text;
          } else if (part.functionCall && part.functionCall.name === "propose_workout") {
            try {
              // Gemini returns arguments as an object directly, not a string
              structuredData = part.functionCall.args;
              if (!replyContent) {
                replyContent = `Here is a proposed workout for you: **${structuredData.name}**. You can review the details below.`;
              }
            } catch (e) {
              console.error("Failed to parse function call arguments", e);
            }
          }
        }
      }
    }

    return new Response(JSON.stringify({ content: replyContent, structured_data: structuredData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Edge function error:", error);
    
    // Check if it's the missing key error specifically
    if (error.message === "Missing GEMINI_API_KEY secret") {
       return new Response(JSON.stringify({ error: "AI Coach is not configured yet. Please contact the administrator." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "AI Coach is temporarily unavailable. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
