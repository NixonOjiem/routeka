import React from "react";
import { Car, Mail, Twitter } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-white/80 backdrop-blur-md border-t border-white/40 shadow-[0_-8px_30px_rgba(0,0,0,0.02)] mt-auto rounded-t-3xl">
      <div className="container mx-auto px-4 sm:px-6 py-12 md:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 mb-10">
          {/* Brand Section */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
            <div className="flex items-center gap-2 text-stone-900">
              <div className="p-2 bg-brand-100 rounded-xl">
                <Car className="w-5 h-5 text-brand" />
              </div>
              <span className="font-display font-bold text-2xl tracking-tight">
                Route KA
              </span>
            </div>
            <p className="text-stone-600 text-sm md:text-base max-w-xs leading-relaxed">
              Strengthening communities by making shared travel safe, reliable,
              and accessible for everyone.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            <h4 className="font-bold text-brand text-xs uppercase tracking-widest">
              Navigation
            </h4>
            <nav className="flex flex-col items-center md:items-start space-y-3">
              <button
                onClick={() => navigate("/")}
                className="text-stone-700 hover:text-brand transition-colors font-medium text-base"
              >
                Home
              </button>
              <button
                onClick={() => navigate("/rides")}
                className="text-stone-700 hover:text-brand transition-colors font-medium text-base"
              >
                Find Rides
              </button>
            </nav>
          </div>

          {/* Connect Section */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            <h4 className="font-bold text-brand text-xs uppercase tracking-widest">
              Connect
            </h4>
            <div className="flex gap-3">
              <a
                href="#"
                className="p-3 bg-stone-100/80 rounded-xl text-stone-600 hover:bg-rose-100 hover:text-rose-600 transition-all duration-300 shadow-sm hover:shadow-md"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-3 bg-stone-100/80 rounded-xl text-stone-600 hover:bg-sky-100 hover:text-sky-600 transition-all duration-300 shadow-sm hover:shadow-md"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              {/* Additional social icons can be added here */}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-stone-200/60 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-stone-500 text-sm text-center md:text-left">
            © {new Date().getFullYear()} Route KA. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-sm text-stone-500 hover:text-brand cursor-pointer transition-colors">
              Terms of Service
            </span>
            <span className="text-sm text-stone-500 hover:text-brand cursor-pointer transition-colors">
              Cookies
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
