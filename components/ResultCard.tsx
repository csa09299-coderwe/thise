import React from 'react';
import type { Variant } from '../types';
import { TagIcon } from './IconComponents';

interface ResultCardProps {
  variant: Variant;
}

export const ResultCard: React.FC<ResultCardProps> = ({ variant }) => {
  const hasError = variant.error || !variant.image_url;
  
  return (
    <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-700/50 flex flex-col h-full animate-fade-in">
      <div className="aspect-video bg-gray-700 overflow-hidden">
        {hasError ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-4">
            <svg className="w-12 h-12 mb-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-center">Failed to generate image</p>
            {variant.error && <p className="text-xs text-gray-500 mt-1 text-center">{variant.error}</p>}
          </div>
        ) : (
          <img src={variant.image_url} alt={variant.purpose} className="w-full h-full object-cover" onError={(e) => {
            // Fallback if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400">Image failed to load</div>';
            }
          }} />
        )}
      </div>
      <div className="p-6 flex-grow flex flex-col">
        <h3 className="text-xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-brand-purple to-brand-pink">{variant.purpose}</h3>
        <p className="text-gray-400 text-sm mb-4 flex-grow">{variant.changes_summary}</p>
        {variant.steps && variant.steps.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <TagIcon />
              Processing Steps
            </h4>
            <div className="flex flex-wrap gap-2">
              {variant.steps.map((step, index) => (
                <span key={index} className="bg-gray-700 text-gray-300 text-xs font-medium px-2.5 py-1 rounded-full">
                  {step.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};