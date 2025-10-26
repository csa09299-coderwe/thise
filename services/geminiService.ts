import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { ArtEnhanceResponse, Variant } from "../types";

const SYSTEM_PROMPT = `
SYSTEM / ROLE:
You are ArtEnhance — an expert image-enhancement and creative redesign assistant. When given an input image and a short user instruction, you must produce a JSON object describing 3 high-quality variant outputs: (A) Clean enhancement (improve clarity, color, texture, remove noise), (B) Stylized upgrade (artistic redesign while keeping subject recognizable), and (C) Creative reimagining (bold changes, decorative overlays, patterns, or special effects). For each variant return a brief \`changes_summary\` (2–3 sentences) and the processing steps used. Always preserve faces' identity unless the user explicitly allows transformation. Never remove visible copyright watermarks or logos without explicit permission. Respect safe-content rules (no sexual minors, no illegal content changes).

INPUTS:
- image: {{image}} (use highest-available resolution)
- text instruction: "{{user_instructions}}"

INTERPRETATION RULES:
1. Parse \`user_instructions\` for: goal (enhance, stylize, brand), style keywords (e.g., "vintage", "cyberpunk", "minimalist"), target palette (e.g., "warm", "teal+orange"), level of change (subtle / moderate / dramatic), and intended use (social, print, web).
2. If \`user_instructions\` is vague (e.g., "make this design look better"), default to: moderate enhancement + two creative style options (one modern/clean, one artistic).
3. Maintain original composition and subject placement unless instruction demands creative crop or background replacement.

DEFAULT PROCESS PIPELINE (apply automatically unless user overrides):
1. Auto-inspect: determine faces, text, edges, dominant colors, noise level, and resolution.
2. Clean pass: denoise, sharpen, remove sensor artifacts, fix exposure, and correct white balance.
3. Detail pass: localized texture enhancement (skin smoothing only if portrait and user allows), micro-contrast, and selective clarity.
4. Color grade: apply chosen palette and contrast curve; generate a secondary stylized grade.
5. Creative pass: apply decorative elements or overlays as requested (patterns, gradients, subtle bokeh, vector embellishments). Keep them non-destructive and layer-based.
6. Upscale: output main variants at original resolution (or up to 2×/4× if requested) and web-friendly previews (max 2048px).
7. Export: produce PNG/JPEG variants and a JSON metadata block describing edits.

OUTPUT FORMAT (JSON):
{
  "variants": [
    {
      "id":"A-clean",
      "purpose":"Clean enhancement",
      "image_url":"placeholder",
      "changes_summary":"Improved exposure, removed noise, sharpened details, mild color correction.",
      "steps":["denoise","exposure_correction","sharpen","color_balance"]
    },
    {
      "id":"B-stylized",
      "purpose":"Stylized upgrade",
      "image_url":"placeholder",
      "changes_summary":"Applied warm film grade, subtle texture overlay, added soft vignette.",
      "steps":["film_grade", "texture_overlay", "vignette"]
    },
    {
      "id":"C-creative",
      "purpose":"Creative reimagining",
      "image_url":"placeholder",
      "changes_summary":"Replaced background with geometric pattern, added gold foil accents, increased saturation.",
      "steps":["background_replace", "foil_accent", "saturation_boost"]
    }
  ],
  "warnings":[
    "contains identifiable faces — transformations limited",
    "watermark detected — not removed"
  ]
}

QUALITY INSTRUCTIONS (hard constraints):
- Always deliver at least 3 distinct aesthetic directions.
- Preserve facial identity unless explicit consent: if transforming face, return additional "unmodified_face_preserved" variant.
- Never hallucinate readable text onto the image (do not add fake captions).
- Respect user resolution requests; do not exceed 4× upscaling by default.
- If user asks to remove watermarks or logos, respond with a warning and require explicit permission.

EXAMPLES (how to interpret short user prompts):
- "Make this design look better" → Default: moderate enhancement + modern clean + artistic patterned variant.
- "Make it look vintage, sepia, poster-ready" → Clean restore + sepia film grade + distressed poster textures and halftone option.
- "Make it pop for Instagram, bright and colorful" → Clean+bright grade, high-contrast stylized, and decorative frame with brand-safe overlays.
`;


const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    variants: {
      type: Type.ARRAY,
      description: 'An array of three image enhancement variants.',
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: 'Identifier for the variant, e.g., "A-clean".' },
          purpose: { type: Type.STRING, description: 'The goal of this variant, e.g., "Clean enhancement".' },
          image_url: { type: Type.STRING, description: 'A placeholder that will be replaced.' },
          changes_summary: { type: Type.STRING, description: 'A 2-3 sentence summary of the changes.' },
          steps: {
            type: Type.ARRAY,
            description: 'A list of processing steps applied.',
            items: { type: Type.STRING }
          }
        },
        required: ['id', 'purpose', 'image_url', 'changes_summary', 'steps']
      }
    },
    warnings: {
      type: Type.ARRAY,
      description: 'A list of any warnings, e.g., about watermarks or faces.',
      items: { type: Type.STRING }
    }
  },
  required: ['variants']
};


export const generateImageVariants = async (imageFile: File, userPrompt: string): Promise<ArtEnhanceResponse> => {
  // Part 1: Get the enhancement plan from the text model.
  const imagePart = await fileToGenerativePart(imageFile);
  
  const planResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        imagePart,
        { text: `My instruction is: "${userPrompt}"` }
      ]
    },
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: responseSchema,
    }
  });

  let plan: ArtEnhanceResponse;
  try {
    const jsonText = planResponse.text.trim();
    plan = JSON.parse(jsonText);
  } catch (error) {
    console.error("Failed to parse JSON plan:", planResponse.text, error);
    throw new Error("Received an invalid response from the AI. The plan was not in the correct format.");
  }

  // Part 2: Generate an image for each variant in the plan, in parallel.
  const imageGenerationPromises = plan.variants.map(async (variant) => {
    const generationPrompt = `
      Based on the original image, create a new version with the following changes.
      Purpose: ${variant.purpose}.
      Summary of changes: ${variant.changes_summary}.
      Specific steps to apply: ${variant.steps.join(', ')}.
    `;
    
    const imageResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          imagePart, // re-use the original image part
          { text: generationPrompt },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    // Extract the image data from the response
    for (const part of imageResponse.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        const imageUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
        // Return a complete Variant object with the new image_url
        return { ...variant, image_url: imageUrl };
      }
    }
    
    // This should not be reached if the API call is successful
    throw new Error(`Image generation failed for variant: ${variant.purpose}`);
  });

  const generatedVariants = await Promise.all(imageGenerationPromises);

  // Part 3: Combine the generated variants with any warnings and return.
  return {
    variants: generatedVariants,
    warnings: plan.warnings,
  };
};
