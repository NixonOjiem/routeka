import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {Link} from "react-router-dom"; // Remove if not using Next.js, or replace with <a>

export const OrderSection = () => {
  const containerRef = useRef(null);
  const { scrollY } = useScroll();

  // Parallax effects for the background shapes
  const carY = useTransform(scrollY, [0, 500], [0, -100]);
  const fadeY = useTransform(scrollY, [0, 500], [0, 150]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24 flex items-center justify-center"
    >
      {/* --- BACKGROUND ELEMENTS (unchanged) --- */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <svg
          className="absolute bottom-0 left-0 w-full h-64 text-stone-200/40"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            fillOpacity="0.3"
            d="M0,192L48,197.3C96,203,192,213,288,208C384,203,480,181,576,186.7C672,192,768,224,864,229.3C960,235,1056,213,1152,186.7C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>

        <motion.div
          style={{ y: carY }}
          className="absolute top-[15%] -left-20 w-150 h-150 rounded-full bg-brand-200/20 blur-3xl"
        />
        <motion.div
          style={{ y: fadeY }}
          className="absolute bottom-[10%] -right-20 w-150 h-150 rounded-full bg-brand-300/10 blur-3xl"
        />

        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(to right, #0A1929 1px, transparent 1px), linear-gradient(to bottom, #0A1929 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* --- MAIN CONTENT (two‑column) --- */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* LEFT COLUMN – unchanged */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-left"
        >
          {/* Premium badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-stone-200/80 shadow-sm mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-500 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-600" />
            </span>
            <span className="text-xs font-mono font-semibold tracking-widest text-stone-700 uppercase">
              Introducing Concierge Rides
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-serif font-light tracking-tight text-stone-900 leading-[1.1] mb-6">
            The commute that
            <span className="block font-bold text-brand-600 mt-2">
              feels like a getaway.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-stone-500 max-w-xl mb-8 leading-relaxed">
            Book a premium ride, choose your professional network, and arrive
            refreshed. Express commuting, elevated.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-12">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative px-8 py-4 bg-stone-900 text-white font-medium rounded-full shadow-2xl hover:bg-stone-800 transition-all flex items-center gap-3"
            >
              <span>Get Early Access</span>
              <div className="bg-white/20 p-1.5 rounded-full group-hover:bg-white/30 transition-colors">
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
                    className="w-10 h-10 rounded-full border-2 border-white bg-stone-200 overflow-hidden shadow-md"
                  >
                    <img
                      src={`https://i.pravatar.cc/150?u=${i}`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-white bg-brand-600 flex items-center justify-center text-xs text-white font-bold shadow-md">
                  +500
                </div>
              </div>
              <p className="text-sm text-stone-400 font-medium">
                professionals on the waitlist
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {["Zero surge pricing", "Verified professionals", "Luxury fleet"].map(
              (text, i) => (
                <div
                  key={i}
                  className="px-5 py-2.5 rounded-full bg-white/70 backdrop-blur-sm border border-stone-200/70 text-sm font-medium text-stone-700 shadow-sm"
                >
                  {text}
                </div>
              )
            )}
          </div>
        </motion.div>

        {/* RIGHT COLUMN – Simplified card (image + button) */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="relative flex justify-center lg:justify-end"
        >
          <div className="relative w-full max-w-md">
            {/* Background glow */}
            <div className="absolute -inset-4 bg-linear-to-r from-brand-200/40 to-brand-300/40 rounded-[3rem] blur-2xl" />

            {/* Card */}
            <div className="relative bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/30 p-6 space-y-6">
              {/* Image */}
              <div className="aspect-video w-full overflow-hidden rounded-2xl">
                <img
                  src="https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
                  alt="Premium car"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Request Ride Button (links to /rides) */}
              <Link to="/rides">
                <button className="w-full py-4 bg-stone-900 text-white font-semibold rounded-xl hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 text-lg">
                  <span>Request ride</span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </Link>

              {/* Animated dots (optional) */}
              <div className="flex justify-center gap-1.5 pt-2">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}
                  className="w-2 h-2 rounded-full bg-brand-500"
                />
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                  className="w-2 h-2 rounded-full bg-brand-400"
                />
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
                  className="w-2 h-2 rounded-full bg-brand-300"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Decorative bottom edge */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-brand-300 to-transparent" />
    </section>
  );
};