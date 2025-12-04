import Anthropic from "npm:@anthropic-ai/sdk@0.26.0";

// Debug logging helper
const log = (message: string, data?: unknown) => {
  const timestamp = new Date().toISOString();
  if (data) {
    console.log(`[generate-video-idea ${timestamp}] ${message}`, JSON.stringify(data, null, 2));
  } else {
    console.log(`[generate-video-idea ${timestamp}] ${message}`);
  }
};

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface VideoIdeaResult {
  title: string;
  hook: string;
  outline: string[];
  format: "short" | "long";
  platform: "tiktok" | "youtube" | "instagram" | "reels";
  extractedText: string;
  confidence: number;
}

Deno.serve(async (req) => {
  log("=== generate-video-idea function called ===");
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
    const { imageBase64, category } = await req.json();
    log("Request body received:", {
      hasImageBase64: !!imageBase64,
      imageBase64Length: imageBase64?.length || 0,
      category,
    });

    // Validate input
    if (!imageBase64) {
      log("ERROR: No image provided");
      return new Response(
        JSON.stringify({ error: "Image required (imageBase64)" }),
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

    // Build prompt based on category
    let prompt = "";

    if (category === "video_idea") {
      prompt = `Analyze this screenshot and generate a complete video content idea for a content creator.

Return ONLY valid JSON with this exact structure:
{
  "title": "Catchy, attention-grabbing video title",
  "hook": "The first 3 seconds hook/opening line to capture attention",
  "outline": ["Key point 1", "Key point 2", "Key point 3", "Key point 4", "Key point 5"],
  "format": "short" or "long",
  "platform": "tiktok" or "youtube" or "instagram" or "reels",
  "extracted_text": "Any relevant text from the screenshot",
  "confidence": 0.0-1.0
}

Guidelines:
- "short" format = under 60 seconds (TikTok, Reels, YouTube Shorts)
- "long" format = over 60 seconds (YouTube, long-form content)
- Choose platform based on content type and target audience
- Make the title click-worthy but not clickbait
- The hook should be provocative or intriguing
- Outline should have 3-5 actionable points
- Extract any relevant text/topics from the image

Return ONLY the JSON object, nothing else.`;
    } else if (category === "hook") {
      prompt = `Analyze this screenshot and extract or create attention-grabbing hooks for content creators.

Return ONLY valid JSON with this structure:
{
  "title": "Main hook/headline",
  "hook": "The attention-grabbing opening line",
  "outline": ["Alternative hook 1", "Alternative hook 2", "Alternative hook 3"],
  "format": "short",
  "platform": "tiktok",
  "extracted_text": "Text visible in the screenshot",
  "confidence": 0.0-1.0
}

Focus on extracting or creating punchy, scroll-stopping hooks. Return ONLY the JSON object.`;
    } else if (category === "script") {
      prompt = `Analyze this screenshot and extract or enhance the script/text content.

Return ONLY valid JSON with this structure:
{
  "title": "Script title or topic",
  "hook": "Opening line",
  "outline": ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5"],
  "format": "long",
  "platform": "youtube",
  "extracted_text": "Full extracted text from the screenshot",
  "confidence": 0.0-1.0
}

Focus on extracting all readable text and organizing it into a usable script outline. Return ONLY the JSON object.`;
    } else if (category === "thumbnail") {
      prompt = `Analyze this thumbnail screenshot for a content creator's reference.

Return ONLY valid JSON with this structure:
{
  "title": "Brief description of what makes this thumbnail effective",
  "hook": "The main text/headline on the thumbnail (if any)",
  "outline": ["Design element 1", "Design element 2", "Design element 3"],
  "format": "short",
  "platform": "youtube",
  "extracted_text": "All text visible on the thumbnail",
  "confidence": 0.0-1.0
}

Focus on analyzing:
- Text placement and styling
- Facial expressions or emotions shown
- Color scheme and contrast
- Composition and layout
- What makes it click-worthy

The outline should list key design elements or techniques used in this thumbnail.
Return ONLY the JSON object, nothing else.`;
    } else if (category === "visual") {
      prompt = `Analyze this screenshot as visual/B-roll inspiration for a content creator.

Return ONLY valid JSON with this structure:
{
  "title": "Brief description of the visual style or content",
  "hook": "The mood or feeling this visual conveys",
  "outline": ["Visual technique 1", "Visual technique 2", "Visual technique 3"],
  "format": "short",
  "platform": "other",
  "extracted_text": "Any text visible in the image",
  "confidence": 0.0-1.0
}

Focus on analyzing:
- Visual style and aesthetic
- Color grading or palette
- Camera angles or composition
- Editing techniques visible
- How this could be recreated or used as B-roll

The outline should list visual techniques or elements that could be replicated.
Return ONLY the JSON object, nothing else.`;
    } else if (category === "analytics") {
      prompt = `Analyze this screenshot of analytics/metrics for a content creator.

Return ONLY valid JSON with this structure:
{
  "title": "Summary of what these analytics show",
  "hook": "The key takeaway or insight from this data",
  "outline": ["Insight 1", "Insight 2", "Insight 3", "Insight 4"],
  "format": "short",
  "platform": "youtube",
  "extracted_text": "All metrics, numbers, and labels visible",
  "confidence": 0.0-1.0
}

Focus on extracting:
- Key metrics (views, likes, engagement rate, CTR, etc.)
- Trends (up/down, growth percentages)
- Time periods shown
- Platform-specific metrics
- Any notable patterns or anomalies

The outline should list actionable insights or observations from the data.
Return ONLY the JSON object, nothing else.`;
    } else {
      // Default fallback
      prompt = `Analyze this screenshot for a content creator's reference.

Return ONLY valid JSON with this structure:
{
  "title": "Brief description of the image",
  "hook": "",
  "outline": [],
  "format": "short",
  "platform": "other",
  "extracted_text": "Any text visible in the image",
  "confidence": 0.0-1.0
}

Return ONLY the JSON object, nothing else.`;
    }

    log("Calling Anthropic API with category:", category);
    const startTime = Date.now();

    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/png",
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: prompt,
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

    // Normalize and validate the response
    const finalResult: VideoIdeaResult = {
      title: typeof result.title === "string" ? result.title : "",
      hook: typeof result.hook === "string" ? result.hook : "",
      outline: Array.isArray(result.outline) ? result.outline.filter((s: unknown) => typeof s === "string") : [],
      format: result.format === "long" ? "long" : "short",
      platform: ["tiktok", "youtube", "instagram", "reels"].includes(result.platform) ? result.platform : "tiktok",
      extractedText: typeof result.extracted_text === "string" ? result.extracted_text : "",
      confidence: typeof result.confidence === "number" ? Math.min(1, Math.max(0, result.confidence)) : 0.5,
    };

    log("=== generate-video-idea SUCCESS ===", finalResult);
    return new Response(
      JSON.stringify(finalResult),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Generation error:", error);
    log("=== generate-video-idea ERROR ===", {
      message: error.message,
      name: error.name,
    });

    // Return error response
    return new Response(
      JSON.stringify({
        error: "Generation failed",
        message: error.message,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
