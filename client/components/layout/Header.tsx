import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout, reset } from "@/redux/slices/authSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { useNavigate } from "react-router-dom";
import { Car, Loader2, Menu, X, User, LogOut, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";

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

  const dropdownRef = useRef<HTMLDivElement>(null);

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
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    console.log("Logout clicked");
    try {
      // Dispatch logout action
      await dispatch(logout()).unwrap();

      // Close dropdown and reset state
      setIsProfileDropdownOpen(false);
      setIsMenuOpen(false);

      // Reset auth state and navigate
      dispatch(reset());
      navigate("/signin");
    } catch (error) {
      console.error("Logout failed", error);
      // Even if there's an error, reset and redirect
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

  // Get user initials for avatar
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
        className={`fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 transition-all duration-500 ease-in-out ${
          scrolled ? "shadow-md" : ""
        }`}
        style={{
          maxHeight: isMenuOpen ? "500px" : scrolled ? "64px" : "80px",
        }}
      >
        <div className="container mx-auto px-4 sm:px-6">
          {/* Top Bar: Logo and Icons */}
          <div
            className={`flex justify-between items-center transition-all duration-500 ${scrolled ? "h-16" : "h-20"}`}
          >
            {/* Logo */}
            <div
              className="flex items-center gap-3 cursor-pointer group select-none active:scale-95 transition-transform duration-200"
              onClick={() => handleNavClick("home")}
            >
              <div className="relative text-brand p-2 rounded-xl overflow-hidden">
                <div className="absolute inset-0 bg-brand-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                <div className="relative z-10 group-hover:translate-x-2 transition-transform duration-500 ease-in-out">
                  <Car className="w-6 h-6" />
                </div>
              </div>
              <span className="font-display font-bold text-xl sm:text-2xl text-brand tracking-tight">
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
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() =>
                      setIsProfileDropdownOpen(!isProfileDropdownOpen)
                    }
                    className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-stone-50 transition-colors duration-200 group"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-linear-to-br from-brand/20 to-brand/10 rounded-full blur-sm group-hover:blur-md transition-all"></div>
                      <div className="relative w-9 h-9 bg-linear-to-br from-brand to-brand/80 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                        {getUserInitials()}
                      </div>
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
                      className={`text-stone-400 transition-transform duration-300 ${
                        isProfileDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-stone-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* Profile Info Section */}
                      <div className="px-4 py-3 border-b border-stone-100">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-linear-to-br from-brand to-brand/70 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {getUserInitials()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-stone-900 truncate">
                              {user.name}
                            </h3>
                            <p className="text-sm text-stone-500 truncate">
                              {user.email}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                              <span className="text-xs text-green-600 font-medium">
                                Online
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <button
                          onClick={() => {
                            handleNavigate("/profile");
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-stone-700 hover:bg-brand/5 transition-colors group"
                        >
                          <div className="p-2 rounded-lg bg-stone-100 group-hover:bg-brand/10 transition-colors">
                            <User
                              size={18}
                              className="text-stone-600 group-hover:text-brand"
                            />
                          </div>
                          <div className="flex-1 text-left">
                            <span className="font-medium">My Profile</span>
                            <p className="text-xs text-stone-400">
                              View and edit profile
                            </p>
                          </div>
                        </button>
                      </div>

                      {/* Logout Button */}
                      <div className="px-3 pt-2 border-t border-stone-100">
                        <button
                          onClick={onLogout}
                          disabled={isLoading}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-linear-to-r from-red-50 to-red-50/50 border border-red-100 text-red-600 rounded-xl font-medium hover:from-red-100 hover:to-red-50 transition-all disabled:opacity-50"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Logging out...</span>
                            </>
                          ) : (
                            <>
                              <LogOut size={18} />
                              <span>Logout</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => handleNavigate("/signin")}
                  className="bg-linear-to-r from-brand to-brand/80 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-brand/20 transition-all"
                >
                  Sign In
                </button>
              )}
            </nav>

            {/* Mobile Menu Toggle */}
            <div className="flex items-center lg:hidden">
              {user ? (
                <div className="relative mr-3" ref={dropdownRef}>
                  <button
                    onClick={() =>
                      setIsProfileDropdownOpen(!isProfileDropdownOpen)
                    }
                    className="p-1.5 rounded-xl hover:bg-stone-50 transition-colors"
                  >
                    <div className="relative w-9 h-9 bg-linear-to-br from-brand to-brand/80 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {getUserInitials()}
                    </div>
                  </button>

                  {/* Mobile Profile Dropdown */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-stone-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-stone-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-linear-to-br from-brand to-brand/70 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                            {getUserInitials()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-stone-900 text-sm truncate">
                              {user.name}
                            </h3>
                            <p className="text-xs text-stone-500 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="py-2">
                        <button
                          onClick={() => {
                            handleNavigate("/profile");
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-stone-700 hover:bg-brand/5 transition-colors"
                        >
                          <User size={18} className="text-stone-600" />
                          <span className="font-medium">My Profile</span>
                        </button>
                      </div>

                      <div className="px-3 pt-2 border-t border-stone-100">
                        <button
                          onClick={onLogout}
                          disabled={isLoading}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Logging out...</span>
                            </>
                          ) : (
                            <>
                              <LogOut size={18} />
                              <span>Logout</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all duration-300"
              >
                <div className="relative w-6 h-6">
                  <div
                    className={`absolute inset-0 transition-all duration-500 transform ${isMenuOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"}`}
                  >
                    <Menu className="w-6 h-6" />
                  </div>
                  <div
                    className={`absolute inset-0 transition-all duration-500 transform ${isMenuOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"}`}
                  >
                    <X className="w-6 h-6" />
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Expanded Mobile Menu */}
          <div
            className={`lg:hidden transition-all duration-500 ease-in-out ${
              isMenuOpen
                ? "opacity-100 translate-y-0 pb-8"
                : "opacity-0 -translate-y-4 pointer-events-none"
            }`}
          >
            <nav className="flex flex-col space-y-2">
              <button
                onClick={() => handleNavClick("home")}
                className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${
                  currentView === "home"
                    ? "bg-stone-100 text-brand font-bold"
                    : "text-stone-700"
                }`}
              >
                Home
              </button>
              <button
                onClick={() => handleNavigate("/rides")}
                className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${
                  currentView === "rides"
                    ? "bg-stone-100 text-brand font-bold"
                    : "text-stone-700"
                }`}
              >
                Rides
              </button>

              {/* Only show these if not showing profile dropdown */}
              {user && !isProfileDropdownOpen && (
                <div className="pt-4 mt-4 border-t border-gray-100">
                  <div className="px-4 mb-4">
                    <p className="text-xs text-gray-500 uppercase">Account</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {user.user_name}
                    </p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <button
                    onClick={() => handleNavigate("/profile")}
                    className="w-full flex items-center gap-3 px-4 py-3 text-stone-700 hover:bg-stone-50 rounded-xl transition-colors"
                  >
                    <User size={18} />
                    <span>My Profile</span>
                  </button>
                  <button
                    onClick={onLogout}
                    className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <LogOut size={18} />
                        Logout
                      </>
                    )}
                  </button>
                </div>
              )}

              {!user && (
                <div className="pt-4 mt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleNavigate("/signin")}
                    className="w-full bg-linear-to-r from-brand to-brand/80 text-white py-3 rounded-xl font-medium"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Spacer */}
      <div
        className={`${scrolled ? "h-16" : "h-20"} transition-all duration-500`}
      />
    </>
  );
};
