export interface Variant {
  id: string;
  purpose: string;
  image_url: string;
  changes_summary: string;
  steps: string[];
  error?: string; // Optional error field for handling generation failures
}

export interface ArtEnhanceResponse {
  variants: Variant[];
  warnings?: string[];
}