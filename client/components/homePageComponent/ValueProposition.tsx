import React from "react";
import { AlertCircle, Sparkles, TrendingUp } from "lucide-react";

export const ValueProposition = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16 lg:py-20">
      {/* Section Heading */}
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-medium text-center text-stone-900 mb-8 md:mb-12 lg:mb-16">
        Why is Route KA here?
      </h2>

      {/* Full-width horizontal banner card */}
      <div className="relative group bg-white/90 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/40 hover:border-rose-200/60 hover:-translate-y-1">
        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 rounded-2xl md:rounded-3xl bg-gradient-to-br from-rose-50/0 to-rose-50/0 group-hover:from-rose-50/30 group-hover:to-rose-100/20 transition-all duration-500 pointer-events-none" />

        {/* Inner content - stacks vertically on mobile, horizontal on sm+ */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-5 sm:gap-8 md:gap-10">
          {/* Icon Container */}
          <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-rose-200/50 transition-all duration-300">
            <AlertCircle className="w-8 h-8 md:w-10 md:h-10" />
          </div>

          {/* Text content */}
          <p className="text-stone-700 text-base sm:text-lg md:text-xl leading-relaxed text-center sm:text-left max-w-2xl">
            Public transit is often slow, but ride sharing solo can be
            expensive. Our platform connects you with nearby riders so you can
            travel efficiently without the solo price tag.
          </p>
        </div>
      </div>
    </section>
  );
};
