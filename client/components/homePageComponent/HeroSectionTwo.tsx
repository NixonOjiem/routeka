import React from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Navigation,
  ArrowRight,
  Star,
  ShieldCheck,
  Clock,
  TrendingUp,
} from "lucide-react";

export const HeroSectionTwo = () => {
  // Animation variants for staggered text
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 -right-20 w-[500px] h-[500px] bg-brand/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-blue-400/10 rounded-full blur-[100px]" />
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side: Copy & Social Proof */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-gray-100 mb-8"
            >
              <TrendingUp size={16} className="text-brand" />
              <span className="text-sm font-semibold bg-gradient-to-r from-brand to-blue-600 bg-clip-text text-transparent">
                #1 Smart Ride-Sharing in KA
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-6xl lg:text-7xl font-display font-extrabold text-gray-900 leading-[1.05] tracking-tight mb-6"
            >
              Move faster, <br />
              <span className="relative inline-block">
                pay smarter.
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 1, duration: 0.8 }}
                  className="absolute bottom-2 left-0 h-3 bg-brand/20 -z-10"
                />
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl text-gray-600 mb-10 max-w-lg leading-relaxed"
            >
              Route KA uses AI-driven route optimization to find you the
              quickest rides at the most competitive local prices.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-8"
            >
              <div className="flex flex-col gap-1">
                <span className="text-2xl font-bold text-gray-900">10k+</span>
                <span className="text-sm text-gray-500 font-medium uppercase tracking-wider">
                  Active Users
                </span>
              </div>
              <div className="w-px h-12 bg-gray-200 hidden sm:block" />
              <div className="flex flex-col gap-1">
                <span className="text-2xl font-bold text-gray-900">4.9/5</span>
                <div className="flex text-yellow-400">
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side: Responsive Search Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="relative"
          >
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50 relative z-10">
              <div className="flex gap-4 mb-8 p-1 bg-gray-100 rounded-2xl">
                <button className="flex-1 py-3 px-4 bg-white rounded-xl shadow-sm text-sm font-bold text-brand transition-all">
                  Ride Now
                </button>
                <button className="flex-1 py-3 px-4 text-sm font-bold text-gray-500 hover:text-gray-700 transition-all">
                  Schedule
                </button>
              </div>

              <div className="space-y-6">
                <div className="group relative">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">
                    Pickup Location
                  </label>
                  <div className="relative">
                    <MapPin
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-brand group-focus-within:scale-110 transition-transform"
                      size={20}
                    />
                    <input
                      type="text"
                      placeholder="Enter pickup point..."
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-brand/20 focus:bg-white rounded-2xl transition-all outline-none text-gray-900 font-medium"
                    />
                  </div>
                </div>

                <div className="group relative">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">
                    Destination
                  </label>
                  <div className="relative">
                    <Navigation
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 group-focus-within:rotate-12 transition-transform"
                      size={20}
                    />
                    <input
                      type="text"
                      placeholder="Where are you going?"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-brand/20 focus:bg-white rounded-2xl transition-all outline-none text-gray-900 font-medium"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-brand text-white font-bold py-5 rounded-2xl shadow-xl shadow-brand/20 hover:shadow-brand/40 transition-all flex items-center justify-center gap-3 mt-4"
                >
                  Calculate Fare
                  <ArrowRight size={20} />
                </motion.button>
              </div>
            </div>

            {/* Floating "Safety" Badge */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 bg-white py-3 px-5 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-3 z-20"
            >
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">
                  Verified Safety
                </p>
                <p className="text-[10px] text-gray-500">24/7 Monitoring</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
