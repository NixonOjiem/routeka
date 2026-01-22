import React from "react";

export const HeroSection = () => {
  return (
    <div className="space-y-6 md:space-y-12 pt-2 md:pt-10 pb-4 md:pb-8 relative overflow-visible animate-fade-in-up flex flex-col justify-start md:justify-center min-h-[calc(100dvh-80px)] md:min-h-0">
      <div className="absolute top-10 left-10 md:left-1/4 w-48 h-48 md:w-72 md:h-72 bg-brand-100/60 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-20 right-10 md:right-1/4 w-48 h-48 md:w-72 md:h-72 bg-cyan-100/60 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 md:left-1/3 w-48 h-48 md:w-72 md:h-72 bg-blue-100/60 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 text-center mb-2 md:mb-16 px-2">
        <h1 className="text-3xl md:text-5xl font-display font-medium text-brand tracking-tight leading-tight mb-2 md:mb-4 drop-shadow-sm">
          The Affordable Express <br />
          <span className="italic text-brand-dark relative">
            Commute is Here!
            <svg
              className="absolute w-full h-1.5 md:h-3 -bottom-1 left-0 text-brand-dark/20 -z-10"
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
          </span>
        </h1>

        <p className="text-[3.2vw] sm:text-[2.8vw] md:text-2xl text-stone-700 mx-auto font-bold leading-tight font-dm-serif mb-6 md:mb-16 tracking-tighter whitespace-nowrap overflow-hidden text-ellipsis">
          Regular Commute. Shared Cost. Big Savings (up to 60%)
        </p>

        <p className="text-xl md:text-3xl text-stone-950 max-w-4xl mx-auto font-normal leading-[1.14] mt-6 md:mt-12 font-futura block">
          Reduce commuting costs by sharing rideshare fares with your
          professional and local networks. Our service integrates you into a
          community of commuters to provide an affordable express experience,
          ensuring you save both time and capital on every journey.
        </p>

        <p className="text-sm md:text-xl mt-2 md:mt-4 font-medium text-brand-dark tracking-wide animate-pulse font-sans px-4">
          WE ARE LAUNCHING SOON!
        </p>
      </div>
    </div>
  );
};
