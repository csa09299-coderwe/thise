import React, { useState, useEffect, useCallback } from 'react';
import { geminiService } from './services/geminiService';
import { 
  AppState, 
  AnalysisResult, 
  UploadedFile, 
  AppError, 
  APIError 
} from './types';
import Header from './components/Header';
import ImageUpload from './components/ImageUpload';
import PromptInput from './components/PromptInput';
import Loader from './components/Loader';
import ResultCard from './components/ResultCard';
import './dark.css';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    isLoading: false,
    error: null,
    currentResult: null,
    history: [],
    uploadedFile: null
  });

  // Cleanup function for preventing memory leaks
  useEffect(() => {
    return () => {
      // Cleanup any ongoing operations
      setState(prev => ({ ...prev, isLoading: false }));
    };
  }, []);

  // Test API connection on mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const isConnected = await geminiService.testConnection();
        if (!isConnected) {
          setState(prev => ({
            ...prev,
            error: 'Failed to connect to Gemini API. Please check your configuration.'
          }));
        }
      } catch (error) {
        console.error('Connection test failed:', error);
        setState(prev => ({
          ...prev,
          error: 'Unable to verify API connection.'
        }));
      }
    };

    testConnection();
  }, []);

  const handleFileSelect = useCallback((file: UploadedFile) => {
    setState(prev => ({
      ...prev,
      uploadedFile: file,
      error: null,
      currentResult: null
    }));
  }, []);

  const handleAnalyze = useCallback(async (prompt: string) => {
    if (!state.uploadedFile) {
      setState(prev => ({
        ...prev,
        error: 'Please upload an image first.'
      }));
      return;
    }

    if (!prompt.trim()) {
      setState(prev => ({
        ...prev,
        error: 'Please enter a prompt.'
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));

    const startTime = Date.now();

    try {
      // Extract base64 data from data URL
      const base64Data = state.uploadedFile.dataUrl.split(',')[1];
      
      const response = await geminiService.analyzeImage({
        imageData: base64Data,
        prompt: prompt.trim(),
        mimeType: state.uploadedFile.type as 'image/jpeg' | 'image/png' | 'image/webp'
      });

      const processingTime = Date.now() - startTime;

      if (response.success && response.data) {
        const newResult: AnalysisResult = {
          id: Date.now().toString(),
          timestamp: new Date(),
          prompt: prompt.trim(),
          response: response.data,
          imageData: state.uploadedFile.dataUrl,
          processingTime
        };

        setState(prev => ({
          ...prev,
          currentResult: newResult,
          history: [newResult, ...prev.history],
          isLoading: false,
          error: null
        }));
      } else {
        throw new APIError(response.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      
      let errorMessage = 'An unexpected error occurred.';
      if (error instanceof APIError) {
        errorMessage = error.message;
      } else if (error instanceof AppError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
    }
  }, [state.uploadedFile]);

  const handleClearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const handleReset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      currentResult: null,
      history: [],
      uploadedFile: null
    });
  }, []);

  const handleDeleteResult = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      history: prev.history.filter(result => result.id !== id),
      currentResult: prev.currentResult?.id === id ? null : prev.currentResult
    }));
  }, []);

  return (
    <div className="app">
      <Header onReset={handleReset} />
      
      <main className="main-content">
        {state.error && (
          <div className="error-banner" role="alert">
            <span className="error-icon">⚠️</span>
            <span className="error-message">{state.error}</span>
            <button 
              className="error-close" 
              onClick={handleClearError}
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        <div className="upload-section">
          <ImageUpload 
            onFileSelect={handleFileSelect}
            disabled={state.isLoading}
          />
        </div>

        {state.uploadedFile && (
          <div className="analysis-section">
            <PromptInput
              onSubmit={handleAnalyze}
              disabled={state.isLoading}
              placeholder="What would you like to know about this image?"
            />
          </div>
        )}

        {state.isLoading && <Loader />}

        {state.currentResult && (
          <div className="current-result">
            <ResultCard
              result={state.currentResult}
              onDelete={handleDeleteResult}
              showDelete={true}
            />
          </div>
        )}

        {state.history.length > 1 && (
          <div className="history-section">
            <h2>Previous Analyses</h2>
            <div className="history-grid">
              {state.history.slice(1).map(result => (
                <ResultCard
                  key={result.id}
                  result={result}
                  onDelete={handleDeleteResult}
                  showDelete={true}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;