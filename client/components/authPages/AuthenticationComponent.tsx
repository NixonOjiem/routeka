import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, register, reset } from "@/redux/slices/authSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export const AuthenticationComponent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const isSignUp = location.pathname === "/signup";
  const [verificationMessage, setVerificationMessage] = useState<string | null>(
    null,
  );
  const [isLoadingSignup, setIsLoadingSignup] = useState(false);
  const [isLoadingSignin, setIsLoadingSignin] = useState(false);

  const handleSwitchTab = (mode: "signin" | "signup") => {
    navigate(`/${mode}${location.search}`);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const verified = params.get("verified");
    const error = params.get("error");

    if (verified === "true") {
      setVerificationMessage(
        "✅ Email verified successfully! You can now log in.",
      );
    } else if (error === "invalid_link") {
      setVerificationMessage("❌ Invalid or expired verification link.");
    } else if (error === "invalid_user") {
      setVerificationMessage("❌ Invalid user.");
    }
  }, [location.search]);

  const { user, isError, message } = useSelector(
    (state: RootState) => state.auth,
  );

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    user_name: "",
    password: "",
  });

  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/");
    }

    if (isError) {
      dispatch(reset());
      setIsLoadingSignup(false);
      setIsLoadingSignin(false);
    }
  }, [user, isError, message, navigate, dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingSignup(true);

    try {
      const resultAction = await dispatch(register(formData));
      if (register.fulfilled.match(resultAction)) {
        // Success logic
        alert(
          "Registration successful! Please check your email to verify your account.",
        );
      } else {
        throw new Error(
          (resultAction.payload as string) || "Registration failed",
        );
      }
    } catch (err: any) {
      // Error logic
    } finally {
      setIsLoadingSignup(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingSignin(true);

    try {
      const resultAction = await dispatch(
        login({
          login: formData.email,
          password: formData.password,
        }),
      );

      if (login.fulfilled.match(resultAction)) {
        // Login successful
      } else {
        throw new Error((resultAction.payload as string) || "Login failed");
      }
    } catch (err: any) {
      // Error logic
    } finally {
      setIsLoadingSignin(false);
    }
  };

  // Animations
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        when: "beforeChildren",
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const panelTextVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      {/* Error Toast */}
      <AnimatePresence>
        {isError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md"
          >
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-lg mx-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 text-red-500">⚠</div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{message}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Verification Message */}
      <AnimatePresence>
        {verificationMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-40 w-full max-w-md p-4 rounded-lg shadow-lg mx-4 ${
              verificationMessage.startsWith("✅")
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            <div className="flex items-center">
              <span className="mr-2">
                {verificationMessage.startsWith("✅") ? "✅" : "❌"}
              </span>
              <p className="text-sm font-medium">
                {verificationMessage.slice(2)}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CARD */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-5xl min-h-[600px] shadow-2xl rounded-2xl overflow-hidden bg-white flex flex-col md:flex-row"
      >
        {/* MOBILE HEADER (Visible only on small screens) */}
        <div className="md:hidden bg-gradient-to-r from-[#3E6272] to-[#2D4A57] text-white p-6 text-center">
          <h1 className="text-2xl font-bold mb-4">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h1>
          <div className="inline-flex bg-white/10 rounded-full p-1">
            <button
              onClick={() => handleSwitchTab("signin")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                !isSignUp ? "bg-white text-[#3E6272]" : "text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => handleSwitchTab("signup")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                isSignUp ? "bg-white text-[#3E6272]" : "text-white"
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* LEFT SIDE: FORM */}
        <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={isSignUp ? "signup-form" : "signin-form"}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md mx-auto"
            >
              <div className="hidden md:block mb-8">
                <h1 className="text-3xl font-bold text-[#3E6272] mb-2">
                  {isSignUp ? "Create Account" : "Welcome Back"}
                </h1>
                <p className="text-gray-500">
                  {isSignUp
                    ? "Enter your details to get started."
                    : "Please enter your details to sign in."}
                </p>
              </div>

              <form
                onSubmit={isSignUp ? handleRegister : handleLogin}
                className="space-y-4"
              >
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4"
                >
                  {isSignUp && (
                    <>
                      <motion.div variants={itemVariants}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3E6272] outline-none transition-all"
                          placeholder="John Doe"
                          required
                        />
                      </motion.div>
                      <motion.div variants={itemVariants}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Username
                        </label>
                        <input
                          name="user_name"
                          value={formData.user_name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3E6272] outline-none transition-all"
                          placeholder="johndoe"
                          required
                        />
                      </motion.div>
                    </>
                  )}

                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {isSignUp ? "Email" : "Email or Username"}
                    </label>
                    <input
                      name="email"
                      type={isSignUp ? "email" : "text"}
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3E6272] outline-none transition-all"
                      placeholder="john@example.com"
                      required
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        name="password"
                        type={passwordVisible ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3E6272] outline-none transition-all pr-12"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setPasswordVisible(!passwordVisible)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {passwordVisible ? "Hide" : "Show"}
                      </button>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="pt-2">
                    <button
                      type="submit"
                      disabled={isSignUp ? isLoadingSignup : isLoadingSignin}
                      className="w-full bg-[#3E6272] text-white py-3.5 px-6 rounded-xl font-semibold shadow-lg hover:bg-[#2D4A57] transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSignUp
                        ? isLoadingSignup
                          ? "Creating..."
                          : "Sign Up"
                        : isLoadingSignin
                          ? "Signing In..."
                          : "Sign In"}
                    </button>
                  </motion.div>
                </motion.div>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* RIGHT SIDE: TOGGLE PANEL (Desktop) */}
        <div className="hidden md:flex w-[40%] bg-gradient-to-br from-[#3E6272] to-[#2D4A57] items-center justify-center p-12 text-white relative overflow-hidden">
          {/* Decorative background circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black opacity-10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>

          <div className="relative z-10 text-center">
            <AnimatePresence mode="wait">
              {isSignUp ? (
                <motion.div
                  key="panel-signin"
                  variants={panelTextVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6"
                >
                  <h2 className="text-3xl font-bold">Already a member?</h2>
                  <p className="text-blue-100 text-lg">
                    To keep connected with us please login with your personal
                    info.
                  </p>
                  <button
                    onClick={() => handleSwitchTab("signin")}
                    className="px-8 py-3 border-2 border-white rounded-full text-white font-semibold hover:bg-white hover:text-[#3E6272] transition-all duration-300 shadow-lg"
                  >
                    Sign In Here
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="panel-signup"
                  variants={panelTextVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6"
                >
                  <h2 className="text-3xl font-bold">New Here?</h2>
                  <p className="text-blue-100 text-lg">
                    Enter your personal details and start your journey with us
                    today.
                  </p>
                  <button
                    onClick={() => handleSwitchTab("signup")}
                    className="px-8 py-3 border-2 border-white rounded-full text-white font-semibold hover:bg-white hover:text-[#3E6272] transition-all duration-300 shadow-lg"
                  >
                    Sign Up Now
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
