import React from "react";
import { Car, Mail, Github, Twitter } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-brand-dark backdrop-blur border-t border-stone-200 py-12 mt-auto rounded-t-2xl">
      <div className="container mx-auto px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand Section */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
            <div className="flex items-center gap-2 text-black">
              <Car className="w-6 h-6" />
              <span className="font-display font-bold text-xl tracking-tight">
                Route KA
              </span>
            </div>
            <p className="text-white text-sm max-w-xs leading-relaxed">
              Strengthening communities by making shared travel safe, reliable,
              and accessible for everyone.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            <h4 className="font-semibold text-black text-sm uppercase tracking-wider">
              Navigation
            </h4>
            <nav className="flex flex-col items-center md:items-start space-y-2 text-sm text-white">
              <button
                onClick={() => navigate("/")}
                className="hover:text-stone-600  transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => navigate("/rides")}
                className="hover:text-stone-600 transition-colors"
              >
                Find Rides
              </button>
            </nav>
          </div>

          {/* Contact/Social Section */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            <h4 className="font-semibold text-black text-sm uppercase tracking-wider">
              Connect
            </h4>
            <div className="flex gap-4">
              <a
                href="#"
                className="p-2 bg-stone-100 rounded-full text-stone-600 hover:bg-brand hover:text-white transition-all"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="p-2 bg-stone-100 rounded-full text-stone-600 hover:bg-brand hover:text-white transition-all"
              >
                <Twitter className="w-4 h-4" />
              </a>
              {/* <a
                href="#"
                className="p-2 bg-stone-100 rounded-full text-stone-600 hover:bg-brand hover:text-white transition-all"
              >
                <Github className="w-4 h-4" />
              </a> */}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-stone-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-stone-600 text-xs text-center md:text-left">
            © {new Date().getFullYear()} Route KA. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-stone-600">
            <span className="hover:text-stone-800 cursor-pointer transition-colors">
              Terms of Service
            </span>
            <span className="hover:text-stone-800 cursor-pointer transition-colors">
              Cookies
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
