import React, { useState } from 'react';
import { Ride } from '../types';
import { findSmartMatches } from '../services/gemini';
import { Sparkles, Search, Loader2, ArrowRight } from 'lucide-react';

interface SmartMatcherProps {
  onMatch: (ids: string[]) => void;
  allRides: Ride[];
}

export const SmartMatcher: React.FC<SmartMatcherProps> = ({ onMatch, allRides }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [lastReasoning, setLastReasoning] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setLastReasoning(null);

    try {
      const result = await findSmartMatches(query, allRides);
      setLastReasoning(result.reasoning);
      onMatch(result.matchedRideIds);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xl shadow-stone-200/50 border border-stone-100 p-8">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-brand" />
        <h3 className="font-display font-semibold text-lg text-stone-800">Intelligent Matching</h3>
      </div>
      
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe your ideal journey (e.g., 'Quiet ride to University before 9 AM')"
          className="w-full pl-5 pr-16 py-4 rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:ring-1 focus:ring-brand focus:border-brand outline-none transition-all text-stone-800 placeholder:text-stone-400 font-light"
        />
        <button 
          type="submit"
          disabled={isSearching || !query.trim()}
          className="absolute right-2 top-2 bottom-2 bg-brand text-white rounded-md px-4 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed hover:bg-brand-dark transition-colors"
        >
          {isSearching ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ArrowRight className="w-4 h-4" />
          )}
        </button>
      </form>

      {lastReasoning && (
        <div className="mt-6 p-5 bg-stone-50 rounded-lg border border-stone-100 animate-in fade-in slide-in-from-top-2">
          <p className="text-sm text-stone-700 font-serif italic leading-relaxed">
            "{lastReasoning}"
          </p>
        </div>
      )}
      
      <div className="mt-6 flex flex-wrap gap-3">
        <span className="text-xs text-stone-400 font-bold uppercase tracking-wider py-1.5">Suggestions:</span>
        {[
          "Downtown with AC", 
          "Campus by 8:30am", 
          "Pet friendly to the park", 
          "Silent ride to library"
        ].map(suggestion => (
          <button
            key={suggestion}
            type="button"
            onClick={() => setQuery(suggestion)}
            className="text-xs px-3 py-1.5 bg-white border border-stone-200 text-stone-500 rounded-full hover:border-brand hover:text-brand transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};