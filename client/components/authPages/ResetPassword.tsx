import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetNewPassword, reset } from "@/redux/slices/authSlice"; // Note the thunk name change to avoid conflict with reset action
import { AppDispatch, RootState } from "@/redux/store";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  // Extract query params
  const params = new URLSearchParams(location.search);
  const token = params.get("token");
  const emailFromUrl = params.get("email");

  const { isLoading, isError, isSuccess, message } = useSelector(
    (state: RootState) => state.auth,
  );

  const [formData, setFormData] = useState({
    password: "",
    password_confirmation: "",
  });

  useEffect(() => {
    dispatch(reset());
  }, [dispatch]);

  // If success, redirect to login after a delay
  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        dispatch(reset());
        navigate("/signin");
      }, 3000);
    }
  }, [isSuccess, navigate, dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirmation) {
      alert("Passwords do not match");
      return;
    }

    dispatch(
      resetNewPassword({
        token,
        email: emailFromUrl,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      }),
    );
  };

  // If token is missing, show error state
  if (!token || !emailFromUrl) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded shadow text-center">
          <h2 className="text-xl font-bold text-red-500 mb-4">Invalid Link</h2>
          <p className="mb-4">
            This password reset link is invalid or incomplete.
          </p>
          <Link to="/forgot-password" className="text-blue-600 hover:underline">
            Request a new one
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#3E6272] mb-2">
            Reset Password
          </h1>
          <p className="text-gray-500">
            Create a new secure password for your account.
          </p>
        </div>

        <AnimatePresence>
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-r"
            >
              <p className="text-green-700 text-sm">
                ✅ {message} Redirecting to login...
              </p>
            </motion.div>
          )}
          {isError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r"
            >
              <p className="text-red-700 text-sm">⚠ {message}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3E6272] outline-none transition-all"
              required
              minLength={8}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3E6272] outline-none transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || isSuccess}
            className="w-full bg-[#3E6272] text-white py-3.5 px-6 rounded-xl font-semibold shadow-lg hover:bg-[#2D4A57] transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
