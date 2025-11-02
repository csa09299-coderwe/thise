// Enhanced type definitions with better type safety

export interface ImageAnalysisRequest {
  imageData: string;
  prompt: string;
  mimeType?: 'image/jpeg' | 'image/png' | 'image/webp';
}

export interface GeminiResponse {
  success: boolean;
  data: string | null;
  error: string | null;
}

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  dataUrl: string;
}

export interface AnalysisResult {
  id: string;
  timestamp: Date;
  prompt: string;
  response: string;
  imageData?: string;
  processingTime: number;
}

export interface AppState {
  isLoading: boolean;
  error: string | null;
  currentResult: AnalysisResult | null;
  history: AnalysisResult[];
  uploadedFile: UploadedFile | null;
}

export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Error types for better error handling
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

export class APIError extends AppError {
  constructor(message: string, statusCode?: number) {
    super(message, 'API_ERROR', statusCode);
  }
}

export class FileUploadError extends AppError {
  constructor(message: string) {
    super(message, 'FILE_UPLOAD_ERROR', 400);
  }
}