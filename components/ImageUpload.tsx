
import React, { useRef } from 'react';
import { UploadIcon } from './IconComponents';

interface ImageUploadProps {
  onImageChange: (file: File | null) => void;
  imagePreview: string | null;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageChange, imagePreview }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onImageChange(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0] || null;
    onImageChange(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold text-gray-300 mb-6">Your Image</h2>
      <label
        htmlFor="image-upload"
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="cursor-pointer w-full aspect-video bg-gray-800 border-2 border-dashed border-gray-600 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-brand-purple hover:text-brand-purple transition-all duration-300 p-4"
      >
        <input
          id="image-upload"
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        {imagePreview ? (
          <img src={imagePreview} alt="Selected preview" className="max-h-full max-w-full object-contain rounded-lg" />
        ) : (
          <div className="text-center space-y-2">
            <UploadIcon />
            <p className="font-semibold">Click to upload or drag & drop</p>
            <p className="text-sm text-gray-500">PNG, JPG, WEBP, etc.</p>
          </div>
        )}
      </label>
    </div>
  );
};
