import React from "react";
import { motion } from "framer-motion";

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden pt-12 pb-8 md:pt-20 md:pb-16 flex flex-col items-center justify-center min-h-fit md:min-h-[70vh]">
      {/* Animated Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-10 left-10 w-48 h-48 bg-brand-100/60 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-20 right-10 w-48 h-48 bg-cyan-100/60 rounded-full blur-3xl animate-blob animation-delay-2000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center px-4 max-w-5xl"
      >
        <h1 className="text-4xl md:text-6xl font-display font-bold text-brand tracking-tight leading-tight mb-6">
          The Affordable Express <br />
          <span className="italic text-brand-dark relative inline-block">
            Commute is Here!
            <motion.svg
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="absolute w-full h-2 md:h-4 -bottom-2 left-0 text-brand-dark/20"
              viewBox="0 0 100 10"
              preserveAspectRatio="none"
            >
              <path
                d="M0 5 Q 50 10 100 5"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
              />
            </motion.svg>
          </span>
        </h1>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="inline-block bg-brand/5 border border-brand/10 px-4 py-2 rounded-full mb-8"
        >
          <p className="text-sm md:text-lg font-bold text-brand-dark">
            Regular Commute • Shared Cost • Save up to 60%
          </p>
        </motion.div>

        <p className="text-lg md:text-2xl text-stone-600 font-futura leading-relaxed mb-8 max-w-3xl mx-auto">
          Reduce commuting costs by sharing rideshare fares with your
          professional and local networks. Enjoy an affordable express
          experience.
        </p>

        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-xs md:text-sm font-bold tracking-widest text-brand"
        >
          WE ARE LAUNCHING SOON
        </motion.p>
      </motion.div>
    </section>
  );
};
