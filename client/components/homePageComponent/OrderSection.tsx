import React, { useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export const OrderSection = () => {
  const containerRef = useRef(null);
  const { scrollY } = useScroll();

  // Parallax effects for background shapes
  const carY = useTransform(scrollY, [0, 500], [0, -100]);
  const fadeY = useTransform(scrollY, [0, 500], [0, 150]);

  // Form state
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [when, setWhen] = useState("now");
  const [scheduleTime, setScheduleTime] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ pickup, dropoff, when, scheduleTime });
    alert("Ride requested! (check console)");
  };

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen overflow-hidden flex items-center justify-center"
    >
      {/* --- BACKGROUND ELEMENTS (same as hero) --- */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        {/* Animated wave lines */}
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

        {/* Floating orbs */}
        <motion.div
          style={{ y: carY }}
          className="absolute top-[15%] -left-20 w-[600px] h-[600px] rounded-full bg-brand-200/20 blur-3xl"
        />
        <motion.div
          style={{ y: fadeY }}
          className="absolute bottom-[10%] -right-20 w-[700px] h-[700px] rounded-full bg-brand-300/10 blur-3xl"
        />

        {/* Subtle grid */}
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
        {/* LEFT COLUMN – Text & CTA (adjusted for ride request) */}
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
              New: Concierge Rides
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-serif font-light tracking-tight text-stone-900 leading-[1.1] mb-6">
            Request a ride,
            <span className="block font-bold text-brand-600 mt-2">
              no categories needed.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-stone-500 max-w-xl mb-8 leading-relaxed">
            Just tell us where and when – we’ll match you with the perfect vehicle. 
            Simple, fast, and premium.
          </p>

          {/* Value props */}
          <div className="flex flex-wrap gap-3">
            {["Zero surge pricing", "Verified professionals", "Premium fleet"].map(
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

        {/* RIGHT COLUMN – Ride request form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="relative flex justify-center lg:justify-end"
        >
          <div className="relative w-full max-w-md">
            {/* Background glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-brand-200/40 to-brand-300/40 rounded-[3rem] blur-2xl" />

            {/* Form card */}
            <div className="relative bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/30 p-6 space-y-6">
              {/* Form header */}
              <div className="flex items-center gap-3 pb-2 border-b border-stone-200">
                <span className="text-2xl">🚗</span>
                <h3 className="text-xl font-medium text-stone-800">Where to?</h3>
              </div>

              {/* Form fields */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Pickup */}
                <div>
                  <label htmlFor="pickup" className="block text-sm font-medium text-stone-600 mb-1">
                    Pickup location
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-stone-400">
                      📍
                    </span>
                    <input
                      type="text"
                      id="pickup"
                      value={pickup}
                      onChange={(e) => setPickup(e.target.value)}
                      placeholder="Enter pickup address"
                      className="w-full pl-10 pr-4 py-3 bg-white/60 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                      required
                    />
                  </div>
                </div>

                {/* Dropoff */}
                <div>
                  <label htmlFor="dropoff" className="block text-sm font-medium text-stone-600 mb-1">
                    Drop-off location
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-stone-400">
                      🏁
                    </span>
                    <input
                      type="text"
                      id="dropoff"
                      value={dropoff}
                      onChange={(e) => setDropoff(e.target.value)}
                      placeholder="Enter destination"
                      className="w-full pl-10 pr-4 py-3 bg-white/60 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                      required
                    />
                  </div>
                </div>

                {/* When toggle */}
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1">
                    When?
                  </label>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setWhen("now")}
                      className={`flex-1 py-3 rounded-xl font-medium transition ${
                        when === "now"
                          ? "bg-brand-600 text-white shadow-md"
                          : "bg-stone-100 text-stone-800 hover:bg-stone-200"
                      }`}
                    >
                      Now
                    </button>
                    <button
                      type="button"
                      onClick={() => setWhen("later")}
                      className={`flex-1 py-3 rounded-xl font-medium transition ${
                        when === "later"
                          ? "bg-brand-600 text-white shadow-md"
                          : "bg-stone-100 text-stone-800 hover:bg-stone-200"
                      }`}
                    >
                      Schedule
                    </button>
                  </div>
                  {when === "later" && (
                    <input
                      type="datetime-local"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="mt-3 w-full px-4 py-3 bg-white/60 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                      required
                    />
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full py-4 bg-stone-900 text-white font-semibold rounded-xl hover:bg-stone-800 transition-colors flex items-center justify-center gap-2"
                >
                  <span>Request ride</span>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </form>

              {/* Animated dots (movement) */}
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
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-300 to-transparent" />
    </section>
  );
};