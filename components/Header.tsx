
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="text-center mb-10 md:mb-12">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-3">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-purple to-brand-pink">
          ArtEnhance AI
        </span>
      </h1>
      <p className="text-lg text-gray-400 max-w-2xl mx-auto">
        Upload an image, provide instructions, and watch AI generate three stunning creative variations.
      </p>
    </header>
  );
};
