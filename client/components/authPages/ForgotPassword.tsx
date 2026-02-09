import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword, reset } from "@/redux/slices/authSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export const ForgotPassword: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, isError, isSuccess, message } = useSelector(
    (state: RootState) => state.auth,
  );

  const [email, setEmail] = useState("");

  // Clear states on mount
  useEffect(() => {
    dispatch(reset());
  }, [dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      dispatch(forgotPassword(email));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#3E6272] mb-2">
            Forgot Password?
          </h1>
          <p className="text-gray-500">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
        </div>

        {/* Success Message */}
        <AnimatePresence>
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-r"
            >
              <p className="text-green-700 text-sm">{message}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {isError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r"
            >
              <p className="text-red-700 text-sm">{message}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3E6272] outline-none transition-all"
              placeholder="john@example.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || isSuccess}
            className="w-full bg-[#3E6272] text-white py-3.5 px-6 rounded-xl font-semibold shadow-lg hover:bg-[#2D4A57] transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/signin"
            className="text-sm text-gray-500 hover:text-[#3E6272] hover:underline"
          >
            Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
