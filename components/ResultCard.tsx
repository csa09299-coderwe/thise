
import React from 'react';
import type { Variant } from '../types';
import { TagIcon } from './IconComponents';

interface ResultCardProps {
  variant: Variant;
}

export const ResultCard: React.FC<ResultCardProps> = ({ variant }) => {
  return (
    <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-700/50 flex flex-col h-full animate-fade-in">
      <div className="aspect-video bg-gray-700 overflow-hidden">
        <img src={variant.image_url} alt={variant.purpose} className="w-full h-full object-cover" />
      </div>
      <div className="p-6 flex-grow flex flex-col">
        <h3 className="text-xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-brand-purple to-brand-pink">{variant.purpose}</h3>
        <p className="text-gray-400 text-sm mb-4 flex-grow">{variant.changes_summary}</p>
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
      </div>
    </div>
  );
};
