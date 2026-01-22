import React from "react";
import { Car } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-white/80 backdrop-blur border-t border-stone-200 py-8 mt-auto">
      <div className="container mx-auto px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
          <Car className="w-5 h-5" />
          <span className="font-display font-bold text-lg">Route KA</span>
        </div>
        <p className="text-stone-400 text-sm">
          © {new Date().getFullYear()} Route KA. Strengthening communities, one
          ride at a time.
        </p>
      </div>
    </footer>
  );
};
