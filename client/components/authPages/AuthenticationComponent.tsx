import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, register, reset } from "@/redux/slices/authSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { useNavigate, useLocation } from "react-router-dom";
// @ts-ignore
import "./Auth.css";

export const AuthenticationComponent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  // ✅ 1. Derive state from URL instead of useState
  // If the URL contains '/signup', isSignUp is true. Otherwise, it defaults to false (signin).
  const isSignUp = location.pathname === "/signup";

  const [verificationMessage, setVerificationMessage] = useState<string | null>(
    null,
  );

  // ✅ 2. Helper function to switch tabs via URL
  const handleSwitchTab = (mode: "signin" | "signup") => {
    // We preserve location.search (e.g., ?verified=true) so messages aren't lost when switching tabs
    navigate(`/${mode}${location.search}`);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    if (params.get("verified") === "true") {
      setVerificationMessage(
        "✅ Email verified successfully! You can now log in.",
      );
    }
    if (params.get("error") === "invalid_link") {
      setVerificationMessage("❌ Invalid or expired verification link.");
    }
    if (params.get("error") === "invalid_user") {
      setVerificationMessage("❌ Invalid user.");
    }
  }, [location.search]);

  // 3. Grab state from Redux
  const { user, isError, message } = useSelector(
    (state: RootState) => state.auth,
  );

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // 4. Handle Redirect and Cleanup
  useEffect(() => {
    if (user) {
      navigate("/");
    }

    if (isError) {
      alert(message);
      dispatch(reset());
    }
  }, [user, isError, message, navigate, dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(register(formData))
      .unwrap()
      .then((res) => {
        alert(res.message);
      })
      .catch((err) => {
        alert(err);
      });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(login({ email: formData.email, password: formData.password }));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 font-sans p-4 md:p-8">
      <div
        id="container"
        className="relative overflow-hidden w-full max-w-[768px] min-h-[550px] bg-white rounded-xl shadow-2xl"
      >
        {/* Verification Message */}
        {verificationMessage && (
          <div
            className={`mb-4 p-3 rounded text-sm text-center ${verificationMessage.startsWith("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            {verificationMessage}
          </div>
        )}

        {/* Sign Up Container */}
        <div
          className={`absolute top-0 h-full transition-all duration-700 ease-in-out left-0 w-full md:w-1/2 z-[1] ${
            isSignUp
              ? "md:translate-x-full opacity-100 z-[5] translate-x-0"
              : "opacity-0 md:opacity-0"
          }`}
        >
          <form
            onSubmit={handleRegister}
            className="bg-white flex flex-col items-center justify-center h-full px-6 sm:px-8 md:px-12 text-center"
          >
            <h1 className="text-xl sm:text-2xl font-bold m-0 py-2 text-[#3E6272]">
              Create Account
            </h1>
            <span className="text-sm text-gray-500 mb-4">
              Join our community today
            </span>
            <input
              name="name"
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="bg-gray-100 border-none p-3 my-2 w-full rounded-lg focus:ring-2 focus:ring-[#3E6272] outline-none text-gray-600 text-sm sm:text-base"
              required
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="bg-gray-100 border-none p-3 my-2 w-full rounded-lg focus:ring-2 focus:ring-[#3E6272] outline-none text-gray-600 text-sm sm:text-base"
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="bg-gray-100 border-none p-3 my-2 w-full rounded-lg focus:ring-2 focus:ring-[#3E6272] outline-none text-gray-600 text-sm sm:text-base"
              required
            />
            <button
              type="submit"
              className="mt-4 rounded-full border border-[#3E6272] bg-[#3E6272] text-white text-xs sm:text-sm font-bold py-3 px-8 sm:px-11 uppercase tracking-wider transition-transform active:scale-95 hover:opacity-90 w-full sm:w-auto"
            >
              Sign Up
            </button>
          </form>
        </div>

        {/* Sign In Container */}
        <div
          className={`absolute top-0 h-full transition-all duration-700 ease-in-out left-0 w-full md:w-1/2 z-[2] ${
            isSignUp
              ? "md:translate-x-full opacity-0 translate-x-full"
              : "opacity-100 translate-x-0"
          }`}
        >
          <form
            onSubmit={handleLogin}
            className="bg-white flex flex-col items-center justify-center h-full px-6 sm:px-8 md:px-12 text-center"
          >
            <h1 className="text-xl sm:text-2xl font-bold m-0 text-[#3E6272] py-2">
              Sign in
            </h1>
            <span className="text-sm text-gray-500 mb-4">Welcome back</span>
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="bg-gray-100 border-none p-3 my-2 w-full rounded-lg focus:ring-2 focus:ring-[#3E6272] outline-none text-gray-600 text-sm sm:text-base"
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="bg-gray-100 border-none p-3 my-2 w-full rounded-lg focus:ring-2 focus:ring-[#3E6272] outline-none text-gray-600 text-sm sm:text-base"
              required
            />
            <button
              type="submit"
              className="mt-6 rounded-full border border-[#3E6272] bg-[#3E6272] text-white text-xs sm:text-sm font-bold py-3 px-8 sm:px-11 uppercase tracking-wider transition-transform active:scale-95 hover:opacity-90 w-full sm:w-auto"
            >
              Sign In
            </button>
          </form>
        </div>

        {/* Mobile Toggle Buttons */}
        <div className="md:hidden absolute bottom-6 left-0 right-0 flex justify-center space-x-4 z-[200] px-6">
          <button
            onClick={() => handleSwitchTab("signin")}
            className={`rounded-full border ${
              !isSignUp
                ? "border-[#3E6272] bg-[#3E6272] text-white"
                : "border-gray-300 bg-transparent text-gray-700"
            } text-xs font-bold py-2 px-6 uppercase tracking-wider transition-all`}
          >
            Sign In
          </button>
          <button
            onClick={() => handleSwitchTab("signup")}
            className={`rounded-full border ${
              isSignUp
                ? "border-[#3E6272] bg-[#3E6272] text-white"
                : "border-gray-300 bg-transparent text-gray-700"
            } text-xs font-bold py-2 px-6 uppercase tracking-wider transition-all`}
          >
            Sign Up
          </button>
        </div>

        {/* Overlay Container - Hidden on mobile */}
        <div
          className={`hidden md:block absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-in-out z-[100] ${
            isSignUp ? "-translate-x-full" : "translate-x-0"
          }`}
        >
          <div
            className={`bg-gradient-to-r from-[#3E6272] to-[#2D4A57] text-white relative -left-full h-full w-[200%] transform transition-transform duration-700 ease-in-out ${
              isSignUp ? "translate-x-1/2" : "translate-x-0"
            }`}
          >
            {/* Left Panel (For Sign In) */}
            <div
              className={`absolute flex flex-col items-center justify-center top-0 h-full w-1/2 px-8 lg:px-10 text-center transition-transform duration-700 ease-in-out ${
                isSignUp ? "translate-x-0" : "-translate-x-[20%]"
              }`}
            >
              <h1 className="text-xl lg:text-2xl font-bold text-white">
                Already a member?
              </h1>
              <p className="text-sm my-4 lg:my-5 px-2">
                Login and continue your journey with us.
              </p>
              <button
                onClick={() => handleSwitchTab("signin")}
                className="rounded-full border border-white bg-transparent text-white text-xs font-bold py-3 px-8 lg:px-11 uppercase tracking-wider transition-transform active:scale-95 hover:bg-white hover:text-[#3E6272]"
              >
                Sign In
              </button>
            </div>

            {/* Right Panel (For Sign Up) */}
            <div
              className={`absolute right-0 flex flex-col items-center justify-center top-0 h-full w-1/2 px-8 lg:px-10 text-center transition-transform duration-700 ease-in-out ${
                isSignUp ? "translate-x-[20%]" : "translate-x-0"
              }`}
            >
              <h1 className="text-xl lg:text-2xl font-bold text-white">
                Hello, Friend!
              </h1>
              <p className="text-sm my-4 lg:my-5 px-2">
                Enter your personal details and start your journey with us.
              </p>
              <button
                onClick={() => handleSwitchTab("signup")}
                className="rounded-full border border-white bg-transparent text-white text-xs font-bold py-3 px-8 lg:px-11 uppercase tracking-wider transition-transform active:scale-95 hover:bg-white hover:text-[#3E6272]"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
