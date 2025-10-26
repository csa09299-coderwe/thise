
import React from 'react';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const PromptInput: React.FC<PromptInputProps> = ({ value, onChange }) => {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="e.g., 'Make it look vintage, sepia, poster-ready'"
      className="w-full h-40 p-4 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-purple focus:border-brand-purple transition-all duration-300 resize-none placeholder-gray-500 text-gray-200"
    />
  );
};
