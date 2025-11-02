import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeminiResponse, ImageAnalysisRequest } from '../types';

// Secure API key retrieval from environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error('VITE_GEMINI_API_KEY environment variable is not set');
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export class GeminiService {
  private static instance: GeminiService;

  private constructor() {}

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  async analyzeImage(request: ImageAnalysisRequest): Promise<GeminiResponse> {
    try {
      // Validate input
      if (!request.imageData || !request.prompt) {
        throw new Error('Image data and prompt are required');
      }

      // Prepare image data for Gemini API
      const imageParts = [
        {
          inlineData: {
            data: request.imageData,
            mimeType: request.mimeType || 'image/jpeg'
          }
        }
      ];

      // Generate content with error handling
      const result = await model.generateContent([
        request.prompt,
        ...imageParts
      ]);

      const response = result.response;
      const text = response.text();

      if (!text) {
        throw new Error('No response received from Gemini API');
      }

      return {
        success: true,
        data: text,
        error: null
      };

    } catch (error) {
      console.error('Gemini API Error:', error);
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('API_KEY')) {
          return {
            success: false,
            data: null,
            error: 'Invalid API key. Please check your configuration.'
          };
        }
        if (error.message.includes('QUOTA_EXCEEDED')) {
          return {
            success: false,
            data: null,
            error: 'API quota exceeded. Please try again later.'
          };
        }
        if (error.message.includes('INVALID_ARGUMENT')) {
          return {
            success: false,
            data: null,
            error: 'Invalid image or prompt format.'
          };
        }
      }

      return {
        success: false,
        data: null,
        error: 'An unexpected error occurred while analyzing the image.'
      };
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const testPrompt = "Hello, can you respond with 'OK'?";
      const result = await model.generateContent(testPrompt);
      return result.response.text().includes('OK');
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

export const geminiService = GeminiService.getInstance();