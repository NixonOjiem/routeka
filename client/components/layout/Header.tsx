import React from "react";
import { ViewState } from "../../types";
import { Car, User } from "lucide-react";

interface HeaderProps {
  onViewChange: (view: ViewState) => void;
  currentView: ViewState;
}

export const Header: React.FC<HeaderProps> = ({
  onViewChange,
  currentView,
}) => {
  return (
    <header className="bg-white/90 backdrop-blur-lg border-b border-stone-200 sticky top-0 z-40 transition-all duration-300">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between max-w-6xl">
        {/* Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer group select-none active:scale-95 transition-transform duration-200"
          onClick={() => onViewChange("home")}
        >
          <div className="relative text-brand p-2 rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-brand-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
            <div className="relative z-10 group-hover:translate-x-2 transition-transform duration-500 ease-in-out">
              <Car className="w-6 h-6" />
            </div>
            <div className="absolute top-1/2 left-1 w-2 h-0.5 bg-brand opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-500 delay-75"></div>
            <div className="absolute top-1/3 left-0 w-1.5 h-0.5 bg-brand opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-500"></div>
          </div>
          <span className="font-display font-bold text-2xl text-brand tracking-tight group-hover:text-brand-dark transition-colors">
            Route KA
          </span>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => onViewChange("home")}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 transform active:scale-95 ${currentView === "home" ? "text-brand bg-stone-100 shadow-inner" : "text-stone-500 hover:text-brand hover:bg-stone-50"}`}
          >
            Home
          </button>
          <button
            onClick={() => onViewChange("request")}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 transform active:scale-95 ${currentView === "request" ? "text-brand bg-stone-100 shadow-inner" : "text-stone-500 hover:text-brand hover:bg-stone-50"}`}
          >
            Request/View Route
          </button>
        </nav>

        {/* User Profile Placeholder */}
        <div className="flex items-center gap-4 pl-8 border-l border-stone-200">
          <div className="hidden sm:block text-right">
            <div className="text-xs text-stone-400 font-medium uppercase tracking-widest">
              Logged in
            </div>
            <div className="text-sm font-display font-semibold text-stone-900">
              Alex M.
            </div>
          </div>
          <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center text-stone-500 cursor-pointer hover:bg-brand hover:text-white transition-all duration-300 border border-stone-200 shadow-sm hover:shadow-md group active:scale-95">
            <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </div>
    </header>
  );
};
