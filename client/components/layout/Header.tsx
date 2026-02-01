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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // We remove the "overflow: hidden" on body because this is an expanding header,
  // not a full-screen takeover, though you can keep it if you want to lock scrolling.

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
        className={`fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 transition-all duration-500 ease-in-out overflow-hidden ${
          scrolled ? "shadow-md" : ""
        }`}
        style={{
          // If menu is open, we let it grow. If not, it's constrained by padding/content.
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
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    Hi, <strong>{user.user_name}</strong>
                  </span>
                  <button
                    onClick={onLogout}
                    className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Logout"
                    )}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleNavigate("/signin")}
                  className="bg-[#3E6272] text-white px-4 py-2 rounded-lg text-sm"
                >
                  Sign In
                </button>
              )}
            </nav>

            {/* Mobile Menu Toggle */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all duration-300"
              >
                {/* Smooth Icon Swap Animation */}
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

          {/* Expanded Mobile Content */}
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

              <div className="pt-4 mt-4 border-t border-gray-100">
                {user ? (
                  <div className="space-y-4">
                    <div className="px-4">
                      <p className="text-xs text-gray-500 uppercase">Account</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {user.user_name}
                      </p>
                    </div>
                    <button
                      onClick={onLogout}
                      className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-medium flex justify-center items-center gap-2"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        "Logout"
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleNavigate("/signin")}
                    className="w-full bg-[#3E6272] text-white py-3 rounded-xl font-medium"
                  >
                    Sign In
                  </button>
                )}
              </div>
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
