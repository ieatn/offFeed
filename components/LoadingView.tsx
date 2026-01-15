import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingView: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-ink-600 space-y-4 animate-in fade-in duration-700">
      <Loader2 className="w-8 h-8 animate-spin" />
      <div className="text-center space-y-2">
        <p className="font-serif text-lg italic">Curating today's brief...</p>
        <p className="text-sm text-ink-600/60 font-sans">Scanning Twitter & Reddit for top stories</p>
      </div>
    </div>
  );
};
