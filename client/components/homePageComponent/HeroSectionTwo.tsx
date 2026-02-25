import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export const HeroSectionTwo = () => {
  const containerRef = useRef(null);
  const { scrollY } = useScroll();

  const carY = useTransform(scrollY, [0, 500], [0, -100]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen overflow-hidden pt-12 pb-12 md:pt-16 md:pb-16 flex items-center justify-center"
    >
      {/* Outer container with max width – mimics CTASection wrapper */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main card with brand background, rounded corners, and shadow */}
        <div className="relative bg-brand rounded-3xl shadow-2xl overflow-visible">
          {/* Mobile: car as faint background */}
          <div className="absolute inset-0 z-0 flex items-center justify-center lg:hidden">
            <img
              src="/Subaru-Taxi.png"
              alt="Car"
              className="object-contain opacity-20 w-120 h-90 sm:w-[30rem] sm:h-120"
            />
          </div>

          {/* Desktop: car – positioned absolutely, hanging off the right */}
          <div
            className="absolute top-1/2 -right-32 transform -translate-y-1/2 z-10 hidden lg:block"
            aria-hidden="true"
          >
            <img
              src="/Subaru-Taxi.png"
              alt="Car"
              className="object-contain drop-shadow-2xl w-180 h-auto"
            />
          </div>

          {/* Text content – with extra right padding on desktop to avoid overlap */}
          <div className="relative z-20 p-8 sm:p-12 lg:p-16 lg:pr-140">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-6 text-center lg:text-left"
            >
              {/* Premium badge – styled with white background */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm border border-white/20 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                </span>
                <span className="text-xs font-mono font-semibold tracking-widest text-brand-dark uppercase">
                  Introducing Concierge Rides
                </span>
              </div>

              {/* Headline – now white for contrast on brand background */}
              <h1 className="text-5xl md:text-7xl font-serif font-light tracking-tight text-white leading-[1.1]">
                The commute that
                <span className="block font-bold text-white mt-2">
                  feels like a getaway.
                </span>
              </h1>

              {/* Description – white with slight opacity */}
              <p className="text-lg md:text-xl text-white/90 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Book a premium ride, choose your professional network, and arrive
                refreshed. Express commuting, elevated.
              </p>

              {/* CTA + Social proof integrated */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative px-8 py-2 bg-white text-brand-dark font-medium rounded-full shadow-2xl hover:bg-gray-100 transition-all flex items-center gap-3 whitespace-nowrap"
                >
                  <span>Book a ride</span>
                  <div className="bg-brand-100 p-1.5 rounded-full group-hover:bg-brand-200 transition-colors">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </motion.button>

                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-full border-2 border-white bg-white/20 overflow-hidden shadow-md"
                      >
                        <img
                          src={`https://i.pravatar.cc/150?u=${i}`}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-white/30 flex items-center justify-center text-xs text-white font-bold shadow-md">
                      +500
                    </div>
                  </div>
                  <p className="text-sm text-white/80 font-medium">
                    professionals on the waitlist
                  </p>
                </div>
              </div>

              {/* Value props – as light pills on brand background */}
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                {["Zero surge pricing", "Verified professionals", "Luxury fleet"].map(
                  (text, i) => (
                    <div
                      key={i}
                      className="px-5 py-2.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-sm font-medium text-white shadow-sm"
                    >
                      {text}
                    </div>
                  )
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};