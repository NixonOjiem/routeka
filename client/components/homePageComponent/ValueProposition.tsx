import React from "react";
import { AlertCircle, Sparkles, TrendingUp } from "lucide-react";

export const ValueProposition = () => {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16 lg:py-20">
      {/* Section Heading */}
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-medium text-center text-stone-900 mb-8 md:mb-12 lg:mb-16">
        Why is Route KA here?
      </h2>

      {/* Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
        {/* Card 1 - The Problem */}
        <div className="group relative bg-white/90 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/40 hover:border-rose-200/60 hover:-translate-y-1">
          {/* Subtle gradient overlay on hover */}
          <div className="absolute inset-0 rounded-2xl md:rounded-3xl bg-gradient-to-br from-rose-50/0 to-rose-50/0 group-hover:from-rose-50/30 group-hover:to-rose-100/20 transition-all duration-500 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Icon Container */}
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-rose-100 text-rose-600 mb-5 md:mb-6 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-rose-200/50 transition-all duration-300">
              <AlertCircle className="w-8 h-8 md:w-10 md:h-10" />
            </div>

            <h3 className="text-2xl md:text-3xl font-display font-bold text-stone-900 mb-3 md:mb-4 group-hover:text-rose-700 transition-colors">
              The Problem
            </h3>

            <p className="text-stone-700 text-base md:text-lg leading-relaxed">
              Expedited travel shouldn't bankrupt you. Solo express options
              impose a crushing financial burden on daily commuters who just
              want to get there on time.
            </p>
          </div>
        </div>

        {/* Card 2 - The Solution */}
        <div className="group relative bg-white/90 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/40 hover:border-brand-200/60 hover:-translate-y-1">
          <div className="absolute inset-0 rounded-2xl md:rounded-3xl bg-gradient-to-br from-brand-50/0 to-brand-50/0 group-hover:from-brand-50/30 group-hover:to-brand-100/20 transition-all duration-500 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-brand-100 text-brand mb-5 md:mb-6 flex items-center justify-center group-hover:bg-brand group-hover:text-white group-hover:shadow-lg group-hover:shadow-brand-200/50 transition-all duration-300">
              <Sparkles className="w-8 h-8 md:w-10 md:h-10" />
            </div>

            <h3 className="text-2xl md:text-3xl font-display font-bold text-stone-900 mb-3 md:mb-4 group-hover:text-brand transition-colors">
              The Solution
            </h3>

            <p className="text-stone-700 text-base md:text-lg leading-relaxed">
              We unlock the express lane for everyone by connecting you with
              colleagues and neighbors. Share the cost, split the ride, and
              enjoy a premium commute.
            </p>
          </div>
        </div>

        {/* Card 3 - Why Choose Us */}
        <div className="group relative bg-white/90 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/40 hover:border-emerald-200/60 hover:-translate-y-1">
          <div className="absolute inset-0 rounded-2xl md:rounded-3xl bg-gradient-to-br from-emerald-50/0 to-emerald-50/0 group-hover:from-emerald-50/30 group-hover:to-emerald-100/20 transition-all duration-500 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-emerald-100 text-emerald-600 mb-5 md:mb-6 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-emerald-200/50 transition-all duration-300">
              <TrendingUp className="w-8 h-8 md:w-10 md:h-10" />
            </div>

            <h3 className="text-2xl md:text-3xl font-display font-bold text-stone-900 mb-3 md:mb-4 group-hover:text-emerald-700 transition-colors">
              Why Choose Us
            </h3>

            <p className="text-stone-700 text-base md:text-lg leading-relaxed">
              We help slash your rideshare costs by up to 60% (or more!!),
              thereby helping you considerably save both time and money. Stop
              overpaying today.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
