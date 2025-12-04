import Anthropic from "npm:@anthropic-ai/sdk@0.26.0";

// Debug logging helper
const log = (message: string, data?: unknown) => {
  const timestamp = new Date().toISOString();
  if (data) {
    console.log(`[analyze-image ${timestamp}] ${message}`, JSON.stringify(data, null, 2));
  } else {
    console.log(`[analyze-image ${timestamp}] ${message}`);
  }
};

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  log("=== analyze-image function called ===");
  log("Request method:", req.method);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    log("Handling CORS preflight");
    return new Response("ok", { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== "POST") {
    log("Method not allowed:", req.method);
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const { imageBase64, imageUrl } = await req.json();
    log("Request body received:", {
      hasImageBase64: !!imageBase64,
      imageBase64Length: imageBase64?.length || 0,
      hasImageUrl: !!imageUrl,
    });

    // Validate input
    if (!imageBase64 && !imageUrl) {
      log("ERROR: No image provided");
      return new Response(
        JSON.stringify({ error: "Image required (imageBase64 or imageUrl)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Anthropic client
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    log("ANTHROPIC_API_KEY present:", !!apiKey);

    if (!apiKey) {
      log("ERROR: ANTHROPIC_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const anthropic = new Anthropic({ apiKey });

    // Build image content for Claude
    const imageContent = imageBase64
      ? { type: "base64" as const, media_type: "image/jpeg" as const, data: imageBase64 }
      : { type: "url" as const, url: imageUrl };

    log("Calling Anthropic API...");
    const startTime = Date.now();

    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: imageContent,
            },
            {
              type: "text",
              text: `Analyze this screenshot and categorize it for a content creator. Return ONLY valid JSON with no additional text:

{
  "category": "hook" | "thumbnail" | "video_idea" | "script" | "visual" | "analytics" | "other",
  "source_platform": "tiktok" | "youtube" | "instagram" | "twitter" | "other",
  "extracted_text": "any readable text in the image (be concise, key text only)",
  "confidence": 0.0-1.0
}

Categories explained:
- hook: Text overlays, captions, opening lines designed to grab attention
- thumbnail: YouTube thumbnails or video cover images
- video_idea: Topic suggestions, content concepts, trending topics
- script: Longer text, outlines, talking points, scripts
- visual: B-roll ideas, transitions, effects, aesthetic inspiration
- analytics: Screenshots of metrics, views, engagement stats
- other: Doesn't fit the above categories

Be concise with extracted_text - only include key phrases, not every word.
Return ONLY the JSON object, nothing else.`,
            },
          ],
        },
      ],
    });

    const elapsed = Date.now() - startTime;
    log("Anthropic API response received:", {
      elapsed: `${elapsed}ms`,
      usage: response.usage,
      stopReason: response.stop_reason,
    });

    // Extract the text content from Claude's response
    const textContent = response.content[0];
    if (textContent.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }
    const text = textContent.text;
    log("Claude response text:", text);

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      log("ERROR: No JSON found in response");
      throw new Error("No JSON found in response");
    }

    const result = JSON.parse(jsonMatch[0]);
    log("Parsed JSON result:", result);

    // Validate and normalize the response
    const validCategories = ["hook", "thumbnail", "video_idea", "script", "visual", "analytics", "other"];
    const validPlatforms = ["tiktok", "youtube", "instagram", "twitter", "other"];

    const finalResult = {
      category: validCategories.includes(result.category) ? result.category : "other",
      source_platform: validPlatforms.includes(result.source_platform) ? result.source_platform : "other",
      extracted_text: typeof result.extracted_text === "string" ? result.extracted_text.slice(0, 1000) : "",
      confidence: typeof result.confidence === "number" ? Math.min(1, Math.max(0, result.confidence)) : 0.5,
    };

    log("=== analyze-image SUCCESS ===", finalResult);
    return new Response(
      JSON.stringify(finalResult),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Analysis error:", error);
    log("=== analyze-image ERROR ===", {
      message: error.message,
      name: error.name,
    });

    // Return fallback response instead of failing completely
    return new Response(
      JSON.stringify({
        category: "other",
        source_platform: "other",
        extracted_text: "",
        confidence: 0,
        error: "Analysis failed - using fallback values",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
