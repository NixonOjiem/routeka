import { useDispatch, useSelector } from "react-redux";
import { logout, reset } from "@/redux/slices/authSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { useNavigate } from "react-router-dom";
import { Car, Loader2, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

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

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  const onLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      dispatch(reset());
      navigate("/signin");
    } catch (error) {
      dispatch(reset());
      navigate("/signin");
    }
  };

  const handleNavClick = (view: string) => {
    onViewChange(view);
    setIsMenuOpen(false);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 transition-all duration-300 ${
          scrolled ? "shadow-sm py-2" : "py-4"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 flex justify-between items-center">
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
              <div className="absolute top-1/2 left-1 w-2 h-0.5 bg-brand opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-500 delay-75"></div>
              <div className="absolute top-1/3 left-0 w-1.5 h-0.5 bg-brand opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-500"></div>
            </div>
            <span className="font-display font-bold text-xl sm:text-2xl text-brand tracking-tight group-hover:text-brand-dark transition-colors">
              Route KA
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleNavClick("home")}
                className={`px-4 sm:px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 transform active:scale-95 ${
                  currentView === "home"
                    ? "text-brand bg-stone-100 shadow-inner"
                    : "text-stone-500 hover:text-brand hover:bg-stone-50"
                }`}
              >
                Home
              </button>
              {/* <button
                onClick={() => handleNavClick("request")}
                className={`px-4 sm:px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 transform active:scale-95 ${
                  currentView === "request"
                    ? "text-brand bg-stone-100 shadow-inner"
                    : "text-stone-500 hover:text-brand hover:bg-stone-50"
                }`}
              >
                Request/View Route
              </button> */}
              <button
                onClick={() => handleNavigate("/rides")}
                className={`px-4 sm:px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 transform active:scale-95 ${
                  currentView === "rides"
                    ? "text-brand bg-stone-100 shadow-inner"
                    : "text-stone-500 hover:text-brand hover:bg-stone-50"
                }`}
              >
                Rides
              </button>
            </div>

            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 hidden md:inline">
                  Hi, <strong>{user.user_name}</strong>
                </span>
                <button
                  onClick={onLogout}
                  disabled={isLoading}
                  className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-all duration-200 active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed min-w-[100px] justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Wait...
                    </>
                  ) : (
                    "Logout"
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleNavigate("/signin")}
                className="bg-[#3E6272] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2d4a57] transition-all duration-200 active:scale-95"
              >
                Sign In
              </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            {user && (
              <span className="text-sm text-gray-600 mr-3 hidden xs:inline">
                Hi, <strong>{user.user_name}</strong>
              </span>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all duration-200 active:scale-95"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div
          className={`lg:hidden fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
            isMenuOpen
              ? "opacity-50 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Mobile Menu Content */}
        <div
          className={`lg:hidden fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-xl transform transition-transform duration-300 ease-out z-40 ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full pt-20 px-6">
            {/* Mobile Navigation */}
            <nav className="flex flex-col space-y-4 flex-1">
              <button
                onClick={() => handleNavClick("home")}
                className={`flex items-center px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 active:scale-[0.98] ${
                  currentView === "home"
                    ? "text-brand bg-stone-100"
                    : "text-stone-700 hover:bg-stone-50"
                }`}
              >
                <span>Home</span>
              </button>
              {/* <button
                onClick={() => handleNavClick("request")}
                className={`flex items-center px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 active:scale-[0.98] ${
                  currentView === "request"
                    ? "text-brand bg-stone-100"
                    : "text-stone-700 hover:bg-stone-50"
                }`}
              >
                <span>Request/View Route</span>
              </button> */}
              <button
                onClick={() => handleNavigate("/rides")}
                className={`flex items-center px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 active:scale-[0.98] ${
                  currentView === "rides"
                    ? "text-brand bg-stone-100"
                    : "text-stone-700 hover:bg-stone-50"
                }`}
              >
                <span>Rides</span>
              </button>
            </nav>

            {/* Mobile User Info & Actions */}
            <div className="py-6 border-t border-gray-200">
              {user ? (
                <div className="space-y-4">
                  <div className="px-4 py-3">
                    <p className="text-sm text-gray-500">Signed in as</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {user.user_name}
                    </p>
                  </div>
                  <button
                    onClick={onLogout}
                    disabled={isLoading}
                    className="w-full bg-red-50 text-red-600 px-4 py-3 rounded-xl text-base font-medium hover:bg-red-100 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Logging out...
                      </>
                    ) : (
                      "Logout"
                    )}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleNavigate("/signin")}
                  className="w-full bg-[#3E6272] text-white px-4 py-3 rounded-xl text-base font-medium hover:bg-[#2d4a57] transition-all duration-200 active:scale-[0.98]"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Spacer to prevent content from being hidden under fixed header */}
      <div className={`${scrolled ? "h-16" : "h-20"} lg:h-20`} />
    </>
  );
};
