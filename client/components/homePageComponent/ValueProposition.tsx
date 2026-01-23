import React, { useState, useRef } from "react";
import { AlertCircle, Sparkles, TrendingUp } from "lucide-react";

export const ValueProposition = () => {
  const lensRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHoveringLens, setIsHoveringLens] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!lensRef.current) return;
    const rect = lensRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 relative pb-12 md:pb-24 overflow-hidden md:overflow-visible">
      <h2 className="text-3xl md:text-5xl font-display font-medium text-center text-stone-900 mb-12 animate-fade-in-up">
        Why is Route KA here?
      </h2>

      {/* Magnifying Glass Lens Container */}
      <div
        ref={lensRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHoveringLens(true)}
        onMouseLeave={() => setIsHoveringLens(false)}
        className="group/lens relative rounded-3xl lg:rounded-[3rem] overflow-hidden bg-white/40 lg:bg-white/20 backdrop-blur-lg lg:backdrop-blur-2xl border border-white/60 shadow-xl lg:shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-6 md:p-10 lg:p-16 lg:animate-breathe transform-gpu cursor-none"
      >
        {/* Animated Shimmer Overlay */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        </div>

        {/* Custom Interactive Magnifier Lens */}
        <div
          className={`
            fixed pointer-events-none z-[60] w-32 h-32 md:w-64 md:h-64 rounded-full 
            border-[3px] md:border-[6px] border-white/80 shadow-[0_0_50px_rgba(255,255,255,0.4),inset_0_0_20px_rgba(0,0,0,0.1)]
            backdrop-blur-[1px] backdrop-saturate-[1.8] backdrop-contrast-[1.1]
            transition-opacity duration-300 ease-out
            flex items-center justify-center
            ${isHoveringLens ? "opacity-100" : "opacity-0"}
          `}
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y}px`,
            transform: "translate(-50%, -50%)",
            backgroundImage:
              "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 70%)",
          }}
        >
          <div className="w-full h-full rounded-full border border-stone-900/10 opacity-20"></div>
        </div>

        <div className="absolute inset-0 bg-white/5 pointer-events-none z-0 mix-blend-overlay"></div>

        <div className="relative z-10 grid md:grid-cols-3 gap-10 md:gap-12">
          {/* The Problem */}
          <div className="text-center group flex flex-col items-center transition-all duration-500 hover:scale-110 hover:z-20">
            <div className="w-20 h-20 lg:w-16 lg:h-16 rounded-full bg-rose-100/80 text-rose-600 mb-6 shadow-sm flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-all duration-300">
              <AlertCircle className="w-10 h-10 lg:w-8 lg:h-8" />
            </div>
            <h3 className="text-3xl lg:text-2xl font-display lg:font-cormorant font-bold text-stone-950 mb-4 drop-shadow-sm group-hover:text-rose-700 transition-colors">
              The Problem
            </h3>
            <p className="text-stone-800 font-futura lg:font-eb-garamond font-normal text-xl md:text-2xl lg:text-xl leading-relaxed drop-shadow-sm">
              Expedited travel shouldn't bankrupt you. Solo express options
              impose a crushing financial burden on daily commuters who just
              want to get there on time.
            </p>
          </div>

          {/* The Solution */}
          <div className="text-center group flex flex-col items-center transition-all duration-500 hover:scale-110 hover:z-20">
            <div className="w-20 h-20 lg:w-16 lg:h-16 rounded-full bg-brand-100/80 text-brand mb-6 shadow-sm flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-all duration-300">
              <Sparkles className="w-10 h-10 lg:w-8 lg:h-8" />
            </div>
            <h3 className="text-3xl lg:text-2xl font-display lg:font-cormorant font-bold text-stone-950 mb-4 drop-shadow-sm group-hover:text-brand-dark transition-colors">
              The Solution
            </h3>
            <p className="text-stone-800 font-futura lg:font-eb-garamond font-normal text-xl md:text-2xl lg:text-xl leading-relaxed drop-shadow-sm">
              We unlock the express lane for everyone by connecting you with
              colleagues and neighbors. Share the cost, split the ride, and
              enjoy a premium commute.
            </p>
          </div>

          {/* Why Choose Us */}
          <div className="text-center group flex flex-col items-center transition-all duration-500 hover:scale-110 hover:z-20">
            <div className="w-20 h-20 lg:w-16 lg:h-16 rounded-full bg-emerald-100/80 text-emerald-600 mb-6 shadow-sm flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
              <TrendingUp className="w-10 h-10 lg:w-8 lg:h-8" />
            </div>
            <h3 className="text-3xl lg:text-2xl font-display lg:font-cormorant font-bold text-stone-900 mb-4 drop-shadow-sm group-hover:text-emerald-700 transition-colors">
              Why Choose Us
            </h3>
            <p className="text-stone-800 font-futura lg:font-eb-garamond font-normal text-xl md:text-2xl lg:text-xl leading-relaxed drop-shadow-sm">
              We help slash your rideshare costs by up to 60% (or more!!),
              thereby helping you considerably save both time and money. Stop
              overpaying today.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
