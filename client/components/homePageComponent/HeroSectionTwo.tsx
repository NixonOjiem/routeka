import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export const HeroSectionTwo = () => {
  const containerRef = useRef(null);
  const { scrollY } = useScroll();

  const carY = useTransform(scrollY, [0, 500], [0, -100]);
  const carRotate = useTransform(scrollY, [0, 500], [0, -3]);

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden flex items-center justify-center"
    >
      {/* Outer container with max width – mimics CTASection wrapper */}
      <div className="w-full">
        {/* Main card with brand background, rounded corners, and shadow */}
        <div className="relative bg-gradient-to-br from-brand to-brand-dark rounded-b-[3rem] shadow-3xl overflow-hidden">
          {/* Abstract pattern overlay for texture */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Gradient orb for visual interest */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-light/20 rounded-full filter blur-3xl translate-x-1/2 translate-y-1/2" />

          {/* Mobile: car as faint background */}
          <div className="absolute inset-0 z-0 flex items-center justify-center lg:hidden">
            <motion.img
              src="/images/ford-mini.png"
              alt="Car"
              className="object-contain opacity-20 w-120 h-90 sm:w-[30rem] sm:h-120"
              style={{ y: carY }}
            />
          </div>

          {/* Desktop: car – positioned absolutely, hanging off the right with parallax */}
          <motion.div
            className="absolute top-1/2 -right-16 transform -translate-y-1/2 z-10 hidden lg:block"
            aria-hidden="true"
            style={{ 
              y: carY,
              rotate: carRotate,
            }}
          >
            <div className="relative">
              {/* Car shadow */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-[90%] h-8 bg-black/20 blur-xl rounded-full" />
              
              {/* Car image with reflection effect - made significantly larger */}
              <div className="relative">
                <img
                  src="/images/ford-mini.png"
                  alt="Car"
                  className="object-contain drop-shadow-3xl w-[42rem] h-auto relative z-10"
                />
                {/* Reflection overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent mix-blend-overlay pointer-events-none rounded-full" />
              </div>
              
              {/* Motion blur effect on scroll */}
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-brand/10 to-transparent blur-2xl" />
            </div>
          </motion.div>

          {/* Text content – reduced right padding to bring content closer */}
          <div className="relative z-20 p-10 sm:p-14 lg:p-16 lg:pr-[28rem]">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6 text-center lg:text-left"
            >
              {/* Premium badge – styled with white background and animation */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
                </span>
                <span className="text-xs font-mono font-semibold tracking-widest text-white uppercase">
                  Introducing Concierge Rides
                </span>
              </motion.div>

              {/* Headline with staggered animation - reduced spacing */}
              <div className="space-y-2">
                <motion.h1 
                  className="text-5xl md:text-7xl font-serif font-light tracking-tight text-white leading-[1.1]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  The commute that
                </motion.h1>
                <motion.h1 
                  className="text-5xl md:text-7xl font-serif font-bold text-white leading-[1.1]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  feels like a getaway.
                </motion.h1>
              </div>

              {/* Description with fade-in */}
              <motion.p 
                className="text-lg md:text-xl text-white/90 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                Book a premium ride, choose your professional network, and arrive
                refreshed. Express commuting, elevated.
              </motion.p>

              {/* CTA + Social proof integrated - reduced gap */}
              <motion.div 
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative px-10 py-4 bg-white text-brand-dark font-semibold rounded-full shadow-2xl hover:bg-gray-50 transition-all duration-300 flex items-center gap-3 whitespace-nowrap text-lg"
                >
                  <span>Book a ride</span>
                  <div className="bg-brand/10 p-1.5 rounded-full group-hover:bg-brand/20 group-hover:translate-x-1 transition-all duration-300">
                    <svg
                      width="20"
                      height="20"
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
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.1, y: -3 }}
                        className="w-11 h-11 rounded-full border-2 border-white bg-gradient-to-br from-white/30 to-white/10 overflow-hidden shadow-lg backdrop-blur-sm"
                      >
                        <img
                          src={`https://i.pravatar.cc/150?u=${i}`}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    ))}
                    <div className="w-11 h-11 rounded-full border-2 border-white bg-white/20 backdrop-blur-sm flex items-center justify-center text-sm text-white font-bold shadow-lg">
                      +500
                    </div>
                  </div>
                  <p className="text-sm text-white/90 font-medium">
                    professionals on the waitlist
                  </p>
                </div>
              </motion.div>

              {/* Value props – as light pills on brand background */}
              <motion.div 
                className="flex flex-wrap gap-2 justify-center lg:justify-start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.8 }}
              >
                {["Zero surge pricing", "Verified professionals", "Luxury fleet"].map(
                  (text, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="px-6 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium text-white shadow-lg hover:bg-white/20 transition-all duration-300 cursor-default"
                    >
                      {text}
                    </motion.div>
                  )
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};