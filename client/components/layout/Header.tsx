import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout, reset } from "@/redux/slices/authSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { useNavigate, useLocation } from "react-router-dom";
import { ViewState } from "@/types";
import {
  Car,
  Loader2,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  MapPin,
  Settings,
  History,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Variants } from "framer-motion";

interface HeaderProps {
  onViewChange: (view: ViewState) => void;
  currentView: ViewState;
}

export const Header = ({ onViewChange, currentView }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading } = useSelector((state: RootState) => state.auth);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const isHomeActive = currentView === "home" || location.pathname === "/";
  const isRidesActive =
    currentView === "rides" || location.pathname === "/rides";

  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Handle Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await dispatch(logout()).unwrap();
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setIsProfileDropdownOpen(false);
      setIsMenuOpen(false);
      dispatch(reset());
      navigate("/signin");
    }
  };

  const handleNavClick = (view: ViewState) => {
    onViewChange(view);
    setIsMenuOpen(false);
    setIsProfileDropdownOpen(false);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
    setIsProfileDropdownOpen(false);
  };

  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Animation variants
  const headerVariants: Variants = {
    initial: { y: -100 },
    animate: {
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
      },
    },
  };

  const dropdownVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 8,
      scale: 0.98,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30,
      },
    },
    exit: {
      opacity: 0,
      y: 8,
      scale: 0.98,
      transition: {
        duration: 0.15,
      },
    },
  };

  const menuVariants: Variants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.2,
      },
    },
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  return (
    <>
      <motion.header
        initial="initial"
        animate="animate"
        variants={headerVariants}
        className={`fixed top-4 left-1/2 transform -translate-x-1/2 w-[95%] md:w-[90%] lg:max-w-7xl z-50 transition-all duration-200 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg"
            : "bg-white/80 backdrop-blur-md shadow-md"
        } border border-white/20 rounded-2xl`}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 cursor-pointer select-none"
              onClick={() => handleNavClick("home")}
            >
              <div className="p-2 bg-brand rounded-lg">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-2xl text-brand">
                  Route KA
                </span>
                <span className="text-xs text-gray-500 font-medium -mt-1">
                  Smart Journey Planner
                </span>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <div className="flex items-center gap-1">
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ y: 0 }}
                  onClick={() => handleNavClick("home")}
                  className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-colors relative ${
                    isHomeActive
                      ? "text-brand-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <span>Home</span>
                  </div>
                  {isHomeActive && (
                    <motion.div
                      className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-brand rounded-full"
                      layoutId="activeIndicator"
                    />
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ y: 0 }}
                  onClick={() => handleNavigate("/rides")}
                  className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-colors relative ${
                    isRidesActive
                      ? "text-brand-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <History size={16} />
                    <span>My Rides</span>
                  </div>
                  {isRidesActive && (
                    <motion.div
                      className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-brand rounded-full"
                      layoutId="activeIndicator"
                    />
                  )}
                </motion.button>
              </div>

              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      setIsProfileDropdownOpen(!isProfileDropdownOpen)
                    }
                    className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                  >
                    <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {getUserInitials()}
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium text-gray-900 leading-tight">
                        {user.user_name}
                      </span>
                      <span className="text-xs text-gray-500 leading-tight">
                        {user.email?.split("@")[0]}
                      </span>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 transition-transform duration-200 ${
                        isProfileDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </motion.button>

                  <AnimatePresence>
                    {isProfileDropdownOpen && (
                      <motion.div
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50"
                      >
                        <div className="p-4 border-b border-gray-100 bg-brand">
                          <p className="font-semibold text-white">
                            {user.name}
                          </p>
                          <p className="text-sm text-white mt-0.5">
                            {user.email}
                          </p>
                        </div>
                        <div className="p-2">
                          <motion.button
                            // whileHover={{ backgroundColor: "#f9fafb" }}
                            whileHover={{ backgroundColor: "#9FB6C0" }}
                            onClick={() => handleNavigate("/profile")}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 rounded-md transition-colors"
                          >
                            <div className="p-1.5 bg-gray-100 rounded-md">
                              <User size={16} className="text-gray-600" />
                            </div>
                            <div className="flex flex-col items-start">
                              <span className="font-medium text-sm">
                                My Profile
                              </span>
                              <span className="text-xs text-gray-500">
                                View & edit profile
                              </span>
                            </div>
                          </motion.button>

                          <motion.button
                            whileHover={{ backgroundColor: "#9FB6C0" }}
                            onClick={() => handleNavigate("/settings")}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 rounded-md transition-colors"
                          >
                            <div className="p-1.5 bg-gray-100 rounded-md">
                              <Settings size={16} className="text-gray-600" />
                            </div>
                            <div className="flex flex-col items-start">
                              <span className="font-medium text-sm">
                                Settings
                              </span>
                              <span className="text-xs text-gray-500">
                                Preferences
                              </span>
                            </div>
                          </motion.button>
                        </div>
                        <div className="p-3 border-t border-gray-100">
                          <motion.button
                            whileHover={{ backgroundColor: "#fee2e2" }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onLogout}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-md font-medium transition-colors disabled:opacity-50"
                          >
                            {isLoading ? (
                              <Loader2 className="animate-spin" size={16} />
                            ) : (
                              <LogOut size={16} />
                            )}
                            <span className="text-sm">
                              {isLoading ? "Logging out..." : "Logout"}
                            </span>
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ y: -1 }}
                    whileTap={{ y: 0 }}
                    onClick={() => handleNavigate("/signin")}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Sign In
                  </motion.button>
                  <motion.button
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleNavigate("/signup")}
                    className="px-5 py-2.5 text-sm font-medium text-white bg-brand hover:bg-brand-900 hover:text-gray-950 rounded-lg transition-colors"
                  >
                    Get Started
                  </motion.button>
                </div>
              )}
            </nav>

            {/* Mobile Menu Actions */}
            <div className="flex items-center lg:hidden gap-3">
              {user && (
                <motion.button
                  ref={menuButtonRef}
                  whileTap={{ scale: 0.9 }}
                  onClick={() =>
                    setIsProfileDropdownOpen(!isProfileDropdownOpen)
                  }
                  className="relative w-10 h-10 bg-brand rounded-full flex items-center justify-center text-white text-sm font-semibold"
                >
                  {getUserInitials()}
                </motion.button>
              )}

              <motion.button
                ref={menuButtonRef}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                variants={menuVariants}
                initial="closed"
                animate="open"
                exit="closed"
                className="lg:hidden overflow-hidden"
              >
                <div className="pb-4 pt-2">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <nav className="flex flex-col space-y-1">
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleNavClick("home")}
                        className={`px-4 py-3 text-left rounded-lg flex items-center gap-3 ${
                          isHomeActive
                            ? "bg-white text-brand shadow-sm"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <MapPin size={20} />
                        <span className="font-medium">Home</span>
                      </motion.button>

                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleNavigate("/rides")}
                        className={`px-4 py-3 text-left rounded-lg flex items-center gap-3 ${
                          isRidesActive
                            ? "bg-white text-brand shadow-sm"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <History size={20} />
                        <span className="font-medium">My Rides</span>
                      </motion.button>

                      {user && (
                        <>
                          <div className="h-px bg-gray-200 my-2" />

                          <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleNavigate("/profile")}
                            className="px-4 py-3 text-left rounded-lg hover:bg-gray-100 flex items-center gap-3"
                          >
                            <User size={20} />
                            <span className="font-medium">Profile</span>
                          </motion.button>

                          <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleNavigate("/settings")}
                            className="px-4 py-3 text-left rounded-lg hover:bg-gray-100 flex items-center gap-3"
                          >
                            <Settings size={20} />
                            <span className="font-medium">Settings</span>
                          </motion.button>
                        </>
                      )}
                    </nav>

                    {!user ? (
                      <div className="flex flex-col gap-3 mt-4">
                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleNavigate("/signin")}
                          className="w-full py-3 text-center font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          Sign In
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleNavigate("/signup")}
                          className="w-full py-3 text-center font-medium text-white bg-brand hover:bg-brand-700 rounded-lg transition-colors"
                        >
                          Get Started
                        </motion.button>
                      </div>
                    ) : (
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={onLogout}
                        disabled={isLoading}
                        className="w-full mt-4 py-3 text-center font-medium text-white bg-red-400 hover:bg-red-800 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="animate-spin" size={18} />
                            <span>Logging out...</span>
                          </>
                        ) : (
                          <>
                            <LogOut size={18} />
                            <span>Logout</span>
                          </>
                        )}
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* Spacer – adjusted for new header height + top offset */}
      <div className="h-20" />
    </>
  );
};
