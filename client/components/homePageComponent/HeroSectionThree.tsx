import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export const HeroSectionTwo = () => {
  const containerRef = useRef(null);

  // Parallax effect for the background elements
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);

  return (
    <section
      ref={containerRef}
      className="relative rounded-3xl overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24 flex flex-col items-center justify-center bg-stone-50"
    >
      {/* --- BACKGROUND LAYER --- */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        {/* Fading Grid */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `radial-gradient(#4F46E5 0.5px, transparent 0.5px), radial-gradient(#4F46E5 0.5px, #f5f5f4 0.5px)`,
            backgroundSize: "40px 40px",
            maskImage:
              "radial-gradient(circle at center, black, transparent 80%)",
          }}
        />

        {/* Animated Orbs with Parallax */}
        <motion.div
          style={{ y: y1 }}
          className="absolute top-[10%] -left-20 w-[500px] h-[500px] bg-brand-200/40 rounded-full blur-[120px]"
        />
        <motion.div
          style={{ y: y2 }}
          className="absolute bottom-[10%] -right-20 w-[600px] h-[600px] bg-cyan-100/50 rounded-full blur-[120px]"
        />
      </div>

      {/* --- CONTENT LAYER --- */}
      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
        {/* 1. Top Badge: Launching Soon */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-stone-200 shadow-sm mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-600"></span>
          </span>
          <span className="text-xs font-bold tracking-widest text-stone-500 uppercase">
            We are launching soon
          </span>
        </motion.div>

        {/* 2. Main Headline: Modernized Spacing */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-8xl font-display font-extrabold tracking-tight text-brand leading-[0.95] mb-8"
        >
          The <span className="text-brand-600">Affordable</span> <br />
          <span className="relative italic font-serif font-light text-brand-600">
            Express Commute
            <svg
              className="absolute -bottom-2 left-0 w-full h-3 text-brand-200 -z-10"
              viewBox="0 0 100 10"
              preserveAspectRatio="none"
            >
              <path
                d="M0 5 Q 50 10 100 5"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
              />
            </svg>
          </span>{" "}
          is Here.
        </motion.h1>

        {/* 3. Value Prop Cards (The "Why") */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mb-10"
        >
          {["60% Cheaper", "Professional Network", "Premium Rides"].map(
            (text, i) => (
              <div
                key={i}
                className="px-4 py-2 rounded-xl bg-white/50 backdrop-blur-md border border-white/20 shadow-sm text-sm font-semibold text-stone-600"
              >
                {text}
              </div>
            ),
          )}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg md:text-xl text-stone-500 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Join a community of professionals who share rides to work. Get the
          comfort of an express commute for the price of a bus ticket.
        </motion.p>

        {/* 4. CTA & Social Proof */}
        {/* <div className="flex flex-col items-center gap-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative"
          >
            <button className="px-10 py-5 bg-stone-900 text-white font-bold rounded-2xl shadow-2xl hover:bg-stone-800 transition-colors flex items-center gap-3">
              Get Early Access
              <div className="bg-white/20 p-1 rounded-md">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </button>
            
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
          </motion.div>

          <div className="flex flex-col items-center gap-3">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-4 border-stone-50 bg-stone-200 overflow-hidden"
                >
                  <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-4 border-stone-50 bg-brand-600 flex items-center justify-center text-[10px] text-white font-bold">
                +500
              </div>
            </div>
            <p className="text-sm text-stone-400 font-medium">
              Professionals already on the waitlist
            </p>
          </div>
        </div> */}
      </div>
    </section>
  );
};
