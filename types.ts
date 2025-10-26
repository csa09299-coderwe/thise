
export interface Variant {
  id: string;
  purpose: string;
  image_url: string;
  changes_summary: string;
  steps: string[];
}

export interface ArtEnhanceResponse {
  variants: Variant[];
  warnings?: string[];
}
