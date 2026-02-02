import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout, reset } from "@/redux/slices/authSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { useNavigate } from "react-router-dom";
import { Car, Loader2, Menu, X, User, LogOut, ChevronDown } from "lucide-react";

interface HeaderProps {
  onViewChange: (view: string) => void;
  currentView: string;
}

export const Header = ({ onViewChange, currentView }: HeaderProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading } = useSelector((state: RootState) => state.auth);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // SEPARATE REFS for Desktop and Mobile to avoid conflicts
  const desktopRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);

  // Handle Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Check if click was outside BOTH desktop and mobile dropdown containers
      const clickedOutsideDesktop =
        desktopRef.current && !desktopRef.current.contains(target);
      const clickedOutsideMobile =
        mobileRef.current && !mobileRef.current.contains(target);

      if (clickedOutsideDesktop && clickedOutsideMobile) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevents the click from bubbling

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

  const handleNavClick = (view: string) => {
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

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 transition-all duration-300 ease-in-out ${
          scrolled ? "shadow-md" : ""
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div
            className={`flex justify-between items-center transition-all duration-300 ${scrolled ? "h-16" : "h-20"}`}
          >
            {/* Logo */}
            <div
              className="flex items-center gap-3 cursor-pointer group active:scale-95 transition-transform"
              onClick={() => handleNavClick("home")}
            >
              <div className="relative text-brand p-2">
                <Car className="w-6 h-6 relative z-10" />
              </div>
              <span className="font-bold text-xl sm:text-2xl text-brand tracking-tight">
                Route KA
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleNavClick("home")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    currentView === "home"
                      ? "text-brand bg-stone-100"
                      : "text-stone-500 hover:text-brand"
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => handleNavigate("/rides")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    currentView === "rides"
                      ? "text-brand bg-stone-100"
                      : "text-stone-500 hover:text-brand"
                  }`}
                >
                  Rides
                </button>
              </div>

              {user ? (
                <div className="relative" ref={desktopRef}>
                  <button
                    onClick={() =>
                      setIsProfileDropdownOpen(!isProfileDropdownOpen)
                    }
                    className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-stone-50 transition-colors"
                  >
                    <div className="w-9 h-9 bg-brand rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {getUserInitials()}
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium text-stone-800 leading-tight">
                        {user.user_name}
                      </span>
                      <span className="text-xs text-stone-500 leading-tight">
                        {user.email?.split("@")[0]}
                      </span>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${isProfileDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Desktop Dropdown Content */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-stone-100 py-3 z-60 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-3 border-b border-stone-100">
                        <p className="font-bold text-stone-900">{user.name}</p>
                        <p className="text-xs text-stone-500">{user.email}</p>
                      </div>
                      <div className="py-2">
                        <button
                          onClick={() => handleNavigate("/profile")}
                          className="w-full flex items-center gap-3 px-4 py-3 text-stone-700 hover:bg-stone-50"
                        >
                          <User size={18} className="text-stone-500" />
                          <span className="font-medium">My Profile</span>
                        </button>
                      </div>
                      <div className="px-3 pt-2 border-t border-stone-100">
                        <button
                          onClick={onLogout}
                          disabled={isLoading}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 disabled:opacity-50"
                        >
                          {isLoading ? (
                            <Loader2 className="animate-spin" size={18} />
                          ) : (
                            <LogOut size={18} />
                          )}
                          <span>{isLoading ? "Logging out..." : "Logout"}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => handleNavigate("/signin")}
                  className="bg-brand text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-all"
                >
                  Sign In
                </button>
              )}
            </nav>

            {/* Mobile Menu Actions */}
            <div className="flex items-center lg:hidden">
              {user && (
                <div className="relative mr-2" ref={mobileRef}>
                  <button
                    onClick={() =>
                      setIsProfileDropdownOpen(!isProfileDropdownOpen)
                    }
                    className="w-9 h-9 bg-brand rounded-full flex items-center justify-center text-white text-sm"
                  >
                    {getUserInitials()}
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border z-60">
                      <button
                        onClick={() => handleNavigate("/profile")}
                        className="w-full text-left px-4 py-3 text-stone-700 flex items-center gap-2"
                      >
                        <User size={16} /> My Profile
                      </button>
                      <button
                        onClick={onLogout}
                        className="w-full text-left px-4 py-3 text-red-600 border-t flex items-center gap-2"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-gray-600"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Expanded Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden pb-6 animate-in slide-in-from-top duration-300">
              <nav className="flex flex-col space-y-2">
                <button
                  onClick={() => handleNavClick("home")}
                  className="px-4 py-3 text-left hover:bg-stone-50 rounded-xl"
                >
                  Home
                </button>
                <button
                  onClick={() => handleNavigate("/rides")}
                  className="px-4 py-3 text-left hover:bg-stone-50 rounded-xl"
                >
                  Rides
                </button>
                {!user && (
                  <button
                    onClick={() => handleNavigate("/signin")}
                    className="mt-4 w-full bg-brand text-white py-3 rounded-xl"
                  >
                    Sign In
                  </button>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Spacer to prevent content from jumping under fixed header */}
      <div className={scrolled ? "h-16" : "h-20"} />
    </>
  );
};
