import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_API_KEY =
  Deno.env.get("GEMINI_API_KEY") ||
  Deno.env.get("GOOGLE_API_KEY") ||
  Deno.env.get("GOOGLE_AI_API_KEY") ||
  Deno.env.get("GEMINI_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Resilient Gemini caller prioritizing Google Gemini 1.5 Flash Vision.
 * Handles timeouts, rate limits, and fallback models seamlessly.
 */
async function callGemini(
  contents: any[],
  options: { tools?: any[]; systemInstruction?: any; generationConfig?: any } = {}
) {
  const configuredModel = Deno.env.get("GEMINI_MODEL")?.trim();
  const candidateModels = [
    ...(configuredModel ? [configuredModel] : []),
    "gemini-1.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash-8b",
    "gemini-1.5-pro",
    "gemini-flash-latest",
  ];

  // Deduplicate candidate models
  const uniqueModels = Array.from(new Set(candidateModels));

  let lastErr = "";
  let lastStatus = 500;
  let isRateLimited = false;
  let isTimeout = false;

  for (const model of uniqueModels) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 28000);

      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents,
            ...options,
          }),
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);

      if (resp.ok) {
        return await resp.json();
      }

      lastStatus = resp.status;
      lastErr = await resp.text();
      console.warn(`Gemini model [${model}] failed (${resp.status}): ${lastErr}`);

      if (resp.status === 429) {
        isRateLimited = true;
      }

      // If model not found (404), overloaded (503), rate limited (429), or unsupported param (400), try next candidate
      if (resp.status === 404 || resp.status === 503 || resp.status === 429 || resp.status === 400) {
        continue;
      }
      break;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        isTimeout = true;
        lastStatus = 504;
        lastErr = 'Upstream Google AI API request timed out';
        continue;
      }
      lastErr = err.message;
    }
  }

  const errorObj = new Error(lastErr || `Google AI API error (${lastStatus})`);
  (errorObj as any).status = lastStatus;
  (errorObj as any).isRateLimited = isRateLimited;
  (errorObj as any).isTimeout = isTimeout;
  throw errorObj;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!GEMINI_API_KEY) {
      throw new Error("Missing GEMINI_API_KEY secret");
    }

    const body = await req.json().catch(() => ({}));
    const {
      task,
      messages,
      context,
      image_base64,
      mime_type = "image/jpeg",
      nutrition_context,
    } = body;

    // Authenticate request: accept valid user JWT or Supabase client authorization
    const authHeader = req.headers.get("Authorization");
    const apikeyHeader = req.headers.get("apikey");
    const token = authHeader?.replace(/^Bearer\s+/i, "");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

    let isAuthenticated = false;
    if (token) {
      if (token === anonKey || apikeyHeader === anonKey) {
        isAuthenticated = true;
      } else {
        try {
          const supabase = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            anonKey ?? "",
            { global: { headers: { Authorization: authHeader } } }
          );
          const { data, error: userError } = await supabase.auth.getUser(token);
          if (!userError && data?.user) {
            isAuthenticated = true;
          }
        } catch {
          // Token verification fallback: allow authenticated client if token present
          if (apikeyHeader === anonKey) {
            isAuthenticated = true;
          }
        }
      }
    } else if (apikeyHeader === anonKey) {
      isAuthenticated = true;
    }

    if (!isAuthenticated) {
      return new Response(JSON.stringify({ error: "Please log in to your GYMTrack account to use AI features." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ──────────────────────────────────────────────────────────────────────────
    // BRANCH 1: AI Food Vision Analysis (Multi-item meal detection)
    // ──────────────────────────────────────────────────────────────────────────
    if (task === "food_multi_item_vision" || task === "food_image_analysis") {
      if (!image_base64 || typeof image_base64 !== "string") {
        return new Response(
          JSON.stringify({
            error: "No image data received for analysis. Please select a photo.",
            code: "MISSING_IMAGE",
            retryable: false,
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      let cleanBase64 = image_base64.trim();
      let cleanMime = mime_type || "image/jpeg";

      // Strip data URI scheme prefix if present
      if (cleanBase64.startsWith("data:")) {
        const mimeMatch = cleanBase64.match(/^data:([^;]+);base64,/i);
        if (mimeMatch) {
          cleanMime = mimeMatch[1];
        }
        cleanBase64 = cleanBase64.replace(/^data:[^;]+;base64,/i, "").trim();
      }

      if (!cleanBase64 || cleanBase64.length < 50) {
        return new Response(
          JSON.stringify({
            error: "Invalid or empty image payload. Please select a valid photo.",
            code: "INVALID_IMAGE",
            retryable: false,
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const visionPrompt = `You are an expert clinical nutrition AI specialized in visual dietary assessment.
Carefully examine the meal photograph provided.

TASKS:
1. Determine if this image actually contains food or beverage. If NOT food or completely unrecognizable, set "is_food": false and provide an explanation in "message".
2. If it is a meal or food, detect all distinct food items visible.
   - For mixed plates (such as Indian thalis, bowls, combo plates), break down distinct components separately (e.g., Cooked Rice, Dal, Paneer Gravy, Roti, Salad).
   - Estimate realistic portion sizes based on visible clues (standard dinner plate ~26cm, katori/bowl ~150ml, glass ~250ml, hands/utensils).
   - Estimate realistic nutritional values (calories, protein, carbs, fat, fiber).
   - Accurately categorize Indian meals (e.g. Yellow Dal Tadka, Paneer Butter Masala, Roti, Chole, Rajma, Idli, Dosa, Poha) as well as international foods (Chicken Breast, Salmon, Pasta, Oats, Salad, Eggs).
3. Be transparent about estimation uncertainty:
   - Provide "confidence": "high" | "medium" | "low".
   - Include brief visual notes (e.g., "Portion estimated from standard bowl; oil content appears moderate").

OUTPUT FORMAT:
Return PURE JSON adhering to this exact schema (no markdown, no backticks):
{
  "is_food": true,
  "items": [
    {
      "name": "Food item name",
      "portion": "e.g. 1 medium katori (150g) or 2 rotis (80g)",
      "servingSize": 150,
      "servingUnit": "g",
      "quantity": 1,
      "calories": 180,
      "protein": 4.5,
      "carbs": 35.0,
      "fat": 2.0,
      "fiber": 1.5,
      "confidence": "medium",
      "notes": "Visual portion estimation"
    }
  ],
  "overall_notes": "All nutritional values are visual estimates. Please review and adjust portions before confirming."
}`;

      const data = await callGemini(
        [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: cleanMime,
                  data: cleanBase64,
                },
              },
              {
                text: visionPrompt,
              },
            ],
          },
        ],
        {
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2, // Low temperature for factual precision
          },
        }
      );

      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

      // Strip markdown code fences if output returned them despite responseMimeType
      const sanitizedJson = rawText
        .trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      let parsedResult;
      try {
        parsedResult = JSON.parse(sanitizedJson);
      } catch (e) {
        console.error("Failed to parse Gemini vision JSON output:", rawText, e);
        return new Response(
          JSON.stringify({
            error: "Unable to parse nutritional details from the image. Please try again with a clearer photo.",
            code: "INVALID_AI_RESPONSE",
            retryable: true,
          }),
          {
            status: 502,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(JSON.stringify(parsedResult), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ──────────────────────────────────────────────────────────────────────────
    // BRANCH 2: Nutrition Assistant Queries
    // ──────────────────────────────────────────────────────────────────────────
    if (task === "nutrition_assistant") {
      const userMessage = messages?.[messages.length - 1]?.content || "Nutrition query";
      const nutritionSystemPrompt = `You are "NutriTrack AI Assistant", an evidence-based sports nutritionist.
You assist athletes using their authentic logged food diary and configured nutritional targets.

USER NUTRITION CONTEXT:
${JSON.stringify(nutrition_context || {}, null, 2)}

GUIDELINES:
1. Strictly base responses on the user's authentic logged intake for today and historical averages provided.
2. If the user asks about remaining calories or protein, calculate accurately:
   Remaining = Target - Consumed.
3. If the user asks for food suggestions to hit remaining protein or calorie targets:
   - Suggest verified high-protein whole foods (e.g. Eggs, Paneer, Chicken breast, Soya chunks, Lentils/Dal, Greek yogurt, Whey).
   - Give estimated portion and protein content.
4. Keep advice concise, motivating, and actionable. Do not use decorative symbols or excessive markdown.`;

      const data = await callGemini(
        [
          {
            role: "user",
            parts: [{ text: userMessage }],
          },
        ],
        {
          systemInstruction: {
            parts: [{ text: nutritionSystemPrompt }],
          },
          generationConfig: {
            temperature: 0.5,
          },
        }
      );

      const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

      return new Response(JSON.stringify({ content: answer }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ──────────────────────────────────────────────────────────────────────────
    // BRANCH 3: Standard GYMTrack Workout AI Coach (100% PRESERVED)
    // ──────────────────────────────────────────────────────────────────────────
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid messages format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build the system prompt using the provided unified context
    const systemPrompt = `You are the "GYMTrack AI Coach & NutriTrack Nutrition Assistant", an expert, evidence-based fitness and sports nutrition coach.
You provide intelligent, concise, and structured guidance based strictly on the user's authentic logged workout data, food entries, and configured targets.

CRITICAL RULES:
1. NEVER fabricate statistics, personal records, sets, volume, logged meals, or body measurements. If data does not exist, explicitly state: "I don't have enough logged data to personalize this yet."
2. DO NOT use raw markdown hashes (###), strange decorative symbols, or excessive stars. Keep formatting clean and readable.
3. Structure responses professionally:
   Title
   Short explanation
   Key points (using simple bullet points •)
   Action / recommendation
   Evidence: (e.g. "Based on your 3 recent bench press sessions" or "Based on your remaining 45g protein budget today").
4. FITNESS & WORKOUTS:
   - When asked about an exercise: provide Targets, Equipment, Step-by-step form cues, Common mistakes, and alternative options.
   - When asked what to train: inspect their recovery context and previous day's workouts. If they trained chest/push recently, recommend Pull (Back/Biceps) or Legs.
5. NUTRITION & FOOD RECOMMENDATIONS:
   - When asked "What should I eat?", "What should I eat for dinner?", "How much protein do I need?":
     a) Read the user's authentic goals and today's logged intake from context.nutrition.
     b) Compute exact remaining calories and macros: Remaining = Target - Consumed.
     c) Strictly respect context.nutrition.dietary_profile.dietary_preference:
        * If Vegetarian: NEVER suggest chicken, beef, pork, fish, seafood, or gelatin.
        * If Vegan: NEVER suggest meat, poultry, fish, eggs, dairy, paneer, whey, or honey.
        * If Eggetarian: Vegetarian foods + eggs are permitted; no meat or fish.
        * If Non-vegetarian: Chicken, eggs, meat, fish, and dairy are all permitted.
     d) Strictly respect context.nutrition.dietary_profile.allergies and food_restrictions (e.g. peanuts, dairy/lactose, gluten). NEVER recommend foods containing their allergens.
     e) Factor in food_budget (e.g., budget-friendly options like lentils, eggs, oats vs flexible), cooking_access (hostel/mess vs full kitchen), and meal_prep_time.
     f) Give specific food portions and realistic estimated macronutrients (calories, protein, carbs, fat).
     g) Explain how the recommendation fits their remaining daily budget.
     h) When recommending a specific meal, invoke the "propose_meal" tool so the user can review and log it directly with one tap!
6. SAFETY: Never provide medical diagnoses or advice on acute joint pain/injuries. Recommend consulting a healthcare professional.

USER CONTEXT:
${JSON.stringify(context, null, 2)}`;

    // Prepare Gemini messages (map 'assistant' to 'model')
    const geminiMessages = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // Define tools for structured output
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
          },
          {
            name: "propose_meal",
            description: "Propose an actionable meal recommendation that fits the user's remaining daily calories/macros and dietary preferences.",
            parameters: {
              type: "object",
              properties: {
                meal_name: { type: "string", description: "Descriptive meal name, e.g. Yellow Dal Tadka with Brown Rice & Cucumber Salad" },
                meal_type: { type: "string", enum: ["breakfast", "lunch", "dinner", "snack"], description: "Meal category" },
                food_name: { type: "string", description: "Primary food item name for food logging" },
                serving_size: { type: "number", description: "Serving portion number, e.g. 1" },
                serving_unit: { type: "string", description: "Serving unit, e.g. plate, bowl, serving" },
                calories: { type: "number", description: "Total estimated calories" },
                protein: { type: "number", description: "Total estimated protein in grams" },
                carbs: { type: "number", description: "Total estimated carbohydrates in grams" },
                fat: { type: "number", description: "Total estimated fat in grams" },
                fiber: { type: "number", description: "Estimated fiber in grams" },
                explanation: { type: "string", description: "Why this meal fits their remaining daily macros" },
              },
              required: ["meal_name", "meal_type", "food_name", "serving_size", "serving_unit", "calories", "protein", "carbs", "fat"],
            },
          },
        ]
      },
    ];

    const data = await callGemini(geminiMessages, {
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      tools: tools,
      generationConfig: {
        temperature: 0.6,
      },
    });

    // Parse Gemini response
    let replyContent = "";
    let structuredData = null;
    let proposedMeal = null;

    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];
      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if (part.text) {
            replyContent += part.text;
          } else if (part.functionCall) {
            if (part.functionCall.name === "propose_workout") {
              try {
                structuredData = part.functionCall.args;
                if (!replyContent) {
                  replyContent = `Here is a proposed workout for you: **${structuredData.name}**. You can review the details below.`;
                }
              } catch (e) {
                console.error("Failed to parse propose_workout function call arguments", e);
              }
            } else if (part.functionCall.name === "propose_meal") {
              try {
                proposedMeal = part.functionCall.args;
                if (!replyContent) {
                  replyContent = `Recommended Meal: **${proposedMeal.meal_name}**\n\n• Estimated Nutrition: ${proposedMeal.calories} kcal | ${proposedMeal.protein}g protein | ${proposedMeal.carbs}g carbs | ${proposedMeal.fat}g fat\n• ${proposedMeal.explanation || 'Fits within your remaining daily nutritional budget.'}`;
                }
              } catch (e) {
                console.error("Failed to parse propose_meal function call arguments", e);
              }
            }
          }
        }
      }
    }

    return new Response(JSON.stringify({
      content: replyContent,
      structured_data: structuredData,
      proposed_meal: proposedMeal,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Edge function error:", error);

    if (error.message === "Missing GEMINI_API_KEY secret") {
      return new Response(
        JSON.stringify({
          error: "AI service requires GEMINI_API_KEY to be configured in Supabase Edge Function secrets.",
          code: "MISSING_SERVER_CONFIG",
          retryable: false,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const status = typeof error.status === 'number' && error.status >= 400 && error.status < 600 ? error.status : 500;
    const isRateLimit = error.isRateLimited || status === 429;
    const isTimeout = error.isTimeout || status === 504;

    const userMessage = isRateLimit
      ? "AI service is currently experiencing high demand. Please retry in a few seconds."
      : isTimeout
      ? "AI analysis request timed out. Please retry with a compressed image."
      : error.message || "AI service is temporarily unavailable. Please try again.";

    return new Response(
      JSON.stringify({
        error: userMessage,
        code: isRateLimit ? "RATE_LIMIT" : isTimeout ? "TIMEOUT" : "INTERNAL_ERROR",
        retryable: isRateLimit || isTimeout || status >= 500,
      }),
      {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
