import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUpload } from './components/ImageUpload';
import { PromptInput } from './components/PromptInput';
import { ResultCard } from './components/ResultCard';
import { Loader } from './components/Loader';
import { SparklesIcon } from './components/IconComponents';
import { generateImageVariants } from './services/geminiService';
import type { ArtEnhanceResponse, Variant } from './types';

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ArtEnhanceResponse | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = useCallback((file: File | null) => {
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onerror = () => {
        setError('Failed to read the image file. Please try another file.');
        setImagePreview(null);
      };
      reader.onloadend = () => {
        if (reader.result && typeof reader.result === 'string') {
          setImagePreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  }, []);

  const handleSubmit = async () => {
    if (!imageFile) {
      setError('Please upload an image.');
      return;
    }
    if (!prompt.trim()) {
      setError('Please provide instructions.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await generateImageVariants(imageFile, prompt.trim());
      
      // Validate response
      if (!response || !response.variants || response.variants.length === 0) {
        throw new Error('No variants were generated. Please try again.');
      }
      
      setResults(response);
    } catch (e) {
      console.error('Error generating variants:', e);
      let errorMessage = 'An unknown error occurred. Please try again later.';
      
      if (e instanceof Error) {
        errorMessage = e.message;
        // Provide more user-friendly messages for common errors
        if (errorMessage.includes('API_KEY') || errorMessage.includes('API key')) {
          errorMessage = 'API key is not configured. Please check your environment variables.';
        } else if (errorMessage.includes('400')) {
          errorMessage = 'The request was invalid. Please check your image and instructions.';
        } else if (errorMessage.includes('401') || errorMessage.includes('403')) {
          errorMessage = 'Authentication failed. Please check your API key.';
        } else if (errorMessage.includes('429')) {
          errorMessage = 'Too many requests. Please wait a moment and try again.';
        } else if (errorMessage.includes('500') || errorMessage.includes('503')) {
          errorMessage = 'Server error. Please try again later.';
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setImageFile(null);
    setImagePreview(null);
    setPrompt('');
    setResults(null);
    setError(null);
  };

  const isFormComplete = imageFile && prompt.trim().length > 0;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col items-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-5xl mx-auto">
        <Header />

        {!results && !isLoading && (
          <div className="w-full animate-fade-in space-y-8">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <ImageUpload onImageChange={handleImageChange} imagePreview={imagePreview} />
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-300">Your Instructions</h2>
                <PromptInput value={prompt} onChange={setPrompt} />
              </div>
            </div>
            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>
        )}
        
        {isLoading && <Loader />}

        {results && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-brand-purple to-brand-pink">Your Enhanced Images</h2>
            {results.warnings && results.warnings.length > 0 && (
                <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-300 px-4 py-3 rounded-lg mb-8 text-sm">
                    <p className="font-bold">Warnings:</p>
                    <ul className="list-disc list-inside ml-2">
                        {results.warnings.map((warning, index) => <li key={index}>{warning}</li>)}
                    </ul>
                </div>
            )}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {results.variants.map((variant: Variant) => (
                <ResultCard key={variant.id} variant={variant} />
              ))}
            </div>
            <div className="text-center mt-12">
              <button
                onClick={handleReset}
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-brand-purple"
              >
                Start Over
              </button>
            </div>
          </div>
        )}

        {!isLoading && !results && (
             <div className="sticky bottom-4 mt-8 w-full flex justify-center z-10">
                <button
                    onClick={handleSubmit}
                    disabled={!isFormComplete || isLoading}
                    className="flex items-center justify-center gap-3 w-full max-w-xs sm:max-w-sm md:max-w-md bg-gradient-to-r from-brand-purple to-brand-pink text-white font-bold py-4 px-8 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transform hover:scale-105"
                >
                    <SparklesIcon />
                    {isLoading ? 'Generating...' : 'Enhance My Image'}
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default App;