import { useDispatch, useSelector } from "react-redux";
import { logout, reset } from "@/redux/slices/authSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { useNavigate } from "react-router-dom";
import { Car, Loader2 } from "lucide-react";

interface HeaderProps {
  onViewChange: (view: string) => void;
  currentView: string;
}

export const Header = ({ onViewChange, currentView }: HeaderProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // 1. Get user AND isLoading from the auth slice
  const { user, isLoading } = useSelector((state: RootState) => state.auth);

  const onLogout = async () => {
    try {
      // Dispatch logout and wait for the backend response
      await dispatch(logout()).unwrap();
      dispatch(reset());
      navigate("/signin");
    } catch (error) {
      // Even if the API call fails, we reset and move to signin
      // because the user's local intent is to leave
      dispatch(reset());
      navigate("/signin");
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 py-4">
      <div className="container mx-auto px-6 flex justify-between items-center">
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

        <nav className="flex items-center space-x-6">
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onViewChange("home")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 transform active:scale-95 ${
                currentView === "home"
                  ? "text-brand bg-stone-100 shadow-inner"
                  : "text-stone-500 hover:text-brand hover:bg-stone-50"
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onViewChange("request")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 transform active:scale-95 ${
                currentView === "request"
                  ? "text-brand bg-stone-100 shadow-inner"
                  : "text-stone-500 hover:text-brand hover:bg-stone-50"
              }`}
            >
              Request/View Route
            </button>
            <button
              onClick={() => navigate("/rides")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 transform active:scale-95 ${
                currentView === "rides"
                  ? "text-brand bg-stone-100 shadow-inner"
                  : "text-stone-500 hover:text-brand hover:bg-stone-50"
              }`}
            >
              Rides
            </button>
          </nav>

          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Hi, <strong>{user.name}</strong>
              </span>
              <button
                onClick={onLogout}
                disabled={isLoading}
                className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed min-w-[100px] justify-center"
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
              onClick={() => navigate("/signin")}
              className="bg-[#3E6272] text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Sign In
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};
