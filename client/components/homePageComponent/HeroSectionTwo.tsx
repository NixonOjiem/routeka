import { useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { X as XIcon } from "lucide-react";
import { CategoryGrid } from "@/components/homePageComponent/CategoryGrid";

// 1. Defined variants outside to prevent duplication and re-renders
const buttonVariants = {
  hover: {
    scale: 1.05,
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    transition: { type: "spring", stiffness: 400, damping: 10 },
  },
  tap: { scale: 0.95 },
  disabled: { opacity: 0.5, cursor: "not-allowed" },
} as const;

export const HeroSectionTwo = () => {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // Scroll Parallax logic
  const { scrollY } = useScroll();
  const carY = useTransform(scrollY, [0, 500], [0, -100]);
  const carRotate = useTransform(scrollY, [0, 500], [0, -3]);

  return (
    <section ref={containerRef} className="relative overflow-hidden flex items-center justify-center">
      <div className="w-full">
        {/* Main Hero Card */}
        <div className="relative bg-linear-to-br from-brand to-brand-dark rounded-b-[3rem] shadow-3xl overflow-hidden p-6 sm:p-10 md:p-16 lg:p-24">
          
          {/* Decorative Grid Texture */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Desktop Car Image with Parallax */}
          <motion.div
            className="absolute top-1/2 -right-16 transform -translate-y-1/2 z-10 hidden lg:block"
            style={{ y: carY, rotate: carRotate }}
          >
            <div className="relative">
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-[90%] h-8 bg-black/20 blur-xl rounded-full" />
              <img
                src="/images/ford-mini.png"
                alt="Car"
                className="object-contain drop-shadow-3xl w-240 h-auto relative z-10"
              />
            </div>
          </motion.div>

          {/* Hero Text Content */}
          <div className="relative z-20 p-6 sm:p-10 lg:p-16 lg:pr-112">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6 text-center lg:text-left"
            >
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif font-light text-white leading-tight">The commute that</h1>
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold text-white leading-tight">feels like a getaway.</h1>
              </div>

              <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
                Book a premium ride, choose your professional network, and arrive refreshed.
              </p>

              {/* Trigger Button */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="group relative px-8 py-4 bg-white text-brand-dark font-bold rounded-full shadow-2xl flex items-center gap-3 uppercase tracking-wider text-sm transition-colors hover:bg-stone-50"
                >
                  <span>Book a ride</span>
                  <div className="bg-brand/10 p-1.5 rounded-full group-hover:bg-brand/20 group-hover:translate-x-1 transition-all">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* MODAL INTEGRATION */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCategoryModalOpen(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />

            {/* Your Modal Structure */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-6xl bg-stone-50 rounded-4xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-white">
                <div>
                  <h2 className="text-2xl font-bold text-stone-800">Choose Ride Type</h2>
                  <p className="text-stone-500 text-sm">Select a category to start your journey</p>
                </div>
                <button
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="p-2 hover:bg-stone-100 rounded-full transition-colors"
                >
                  <XIcon className="w-6 h-6 text-stone-500" />
                </button>
              </div>

              <div className="overflow-y-auto p-6 md:p-10">
                <CategoryGrid
                  onRequestRoute={(id) => {
                    setIsCategoryModalOpen(false);
                    navigate("/request", { state: { categoryId: id } });
                  }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};