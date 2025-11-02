import React, { useCallback, useState } from 'react';
import { UploadedFile, FileUploadError, ValidationError } from '../types';

interface ImageUploadProps {
  onFileSelect: (file: UploadedFile) => void;
  className?: string;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onFileSelect, 
  className = '', 
  disabled = false 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Configuration from environment variables
  const MAX_FILE_SIZE = parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '10485760'); // 10MB default
  const ALLOWED_TYPES = (import.meta.env.VITE_ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp').split(',');

  const validateFile = useCallback((file: File): void => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      throw new ValidationError(`File size must be less than ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB`);
    }

    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new ValidationError(`File type ${file.type} is not allowed. Allowed types: ${ALLOWED_TYPES.join(', ')}`);
    }

    // Check file name for potential security issues
    if (file.name.includes('..') || /[<>:"/\\|?*]/.test(file.name)) {
      throw new ValidationError('Invalid file name');
    }
  }, [MAX_FILE_SIZE, ALLOWED_TYPES]);

  const processFile = useCallback(async (file: File): Promise<UploadedFile> => {
    try {
      validateFile(file);

      // Convert file to data URL with proper error handling
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new FileUploadError('Failed to process file'));
          }
        };

        reader.onerror = () => {
          reject(new FileUploadError('Failed to read file'));
        };

        // Set timeout to prevent hanging
        setTimeout(() => {
          reject(new FileUploadError('File processing timeout'));
        }, 10000);

        reader.readAsDataURL(file);
      });

      return {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        dataUrl
      };
    } catch (error) {
      if (error instanceof ValidationError || error instanceof FileUploadError) {
        throw error;
      }
      throw new FileUploadError('Unexpected error processing file');
    }
  }, [validateFile]);

  const handleFile = useCallback(async (file: File) => {
    if (disabled) return;

    setError(null);

    try {
      const uploadedFile = await processFile(file);
      onFileSelect(uploadedFile);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process file';
      setError(errorMessage);
      console.error('File upload error:', error);
    }
  }, [disabled, onFileSelect, processFile]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, [disabled]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;

    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  }, [disabled, handleFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled) return;

    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  }, [disabled, handleFile]);

  return (
    <div className={`image-upload ${className}`}>
      <div
        className={`upload-area ${dragActive ? 'drag-active' : ''} ${disabled ? 'disabled' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={ALLOWED_TYPES.join(',')}
          onChange={handleChange}
          disabled={disabled}
          id="file-upload"
          className="file-input"
        />
        <label htmlFor="file-upload" className="upload-label">
          <div className="upload-content">
            <div className="upload-icon">📁</div>
            <p className="upload-text">
              {disabled ? 'Upload disabled' : 'Click to upload or drag and drop'}
            </p>
            <p className="upload-subtext">
              {ALLOWED_TYPES.join(', ')} (Max {Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB)
            </p>
          </div>
        </label>
      </div>
      
      {error && (
        <div className="error-message" role="alert">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;