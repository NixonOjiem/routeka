import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// @ts-ignore
import "./Auth.css";

export const AuthenticationComponent: React.FC = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Registration Data:", formData);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login Data:", {
      email: formData.email,
      password: formData.password,
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 font-sans p-4">
      <div
        id="container"
        className="relative overflow-hidden w-full max-w-[768px] min-h-[550px] bg-white rounded-xl shadow-2xl"
      >
        {/* Sign Up Container */}
        <div
          className={`absolute top-0 h-full transition-all duration-700 ease-in-out left-0 w-1/2 z-[1] ${
            isSignUp ? "translate-x-full opacity-100 z-[5]" : "opacity-0"
          }`}
        >
          <form
            onSubmit={handleRegister}
            className="bg-white flex flex-col items-center justify-center h-full px-8 md:px-12 text-center"
          >
            {/* Text Color Updated */}
            <h1 className="text-2xl font-bold m-0 py-2 text-[#3E6272]">
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
              className="bg-gray-100 border-none p-3 my-2 w-full rounded-lg focus:ring-2 focus:ring-[#3E6272] outline-none text-gray-600"
              required
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="bg-gray-100 border-none p-3 my-2 w-full rounded-lg focus:ring-2 focus:ring-[#3E6272] outline-none text-gray-600"
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="bg-gray-100 border-none p-3 my-2 w-full rounded-lg focus:ring-2 focus:ring-[#3E6272] outline-none text-gray-600"
              required
            />
            {/* Button Color Updated */}
            <button
              type="submit"
              className="mt-4 rounded-full border border-[#3E6272] bg-[#3E6272] text-white text-xs font-bold py-3 px-11 uppercase tracking-wider transition-transform active:scale-95 hover:opacity-90"
            >
              Sign Up
            </button>
          </form>
        </div>

        {/* Sign In Container */}
        <div
          className={`absolute top-0 h-full transition-all duration-700 ease-in-out left-0 w-1/2 z-[2] ${
            isSignUp ? "translate-x-full opacity-0" : "opacity-100"
          }`}
        >
          <form
            onSubmit={handleLogin}
            className="bg-white flex flex-col items-center justify-center h-full px-8 md:px-12 text-center"
          >
            {/* Text Color Updated */}
            <h1 className="text-2xl font-bold m-0 text-[#3E6272] py-2">
              Sign in
            </h1>
            <span className="text-sm text-gray-500 mb-4">Welcome back</span>
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="bg-gray-100 border-none p-3 my-2 w-full rounded-lg focus:ring-2 focus:ring-[#3E6272] outline-none text-gray-600"
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="bg-gray-100 border-none p-3 my-2 w-full rounded-lg focus:ring-2 focus:ring-[#3E6272] outline-none text-gray-600"
              required
            />
            {/* Button Color Updated */}
            <button
              type="submit"
              className="mt-6 rounded-full border border-[#3E6272] bg-[#3E6272] text-white text-xs font-bold py-3 px-11 uppercase tracking-wider transition-transform active:scale-95 hover:opacity-90"
            >
              Sign In
            </button>
          </form>
        </div>

        {/* Overlay Container */}
        <div
          className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-in-out z-[100] ${
            isSignUp ? "-translate-x-full" : "translate-x-0"
          }`}
        >
          {/* Gradient Updated to use #3E6272 */}
          <div
            className={`bg-gradient-to-r from-[#3E6272] to-[#2D4A57] text-white relative -left-full h-full w-[200%] transform transition-transform duration-700 ease-in-out ${
              isSignUp ? "translate-x-1/2" : "translate-x-0"
            }`}
          >
            {/* Left Panel */}
            <div
              className={`absolute flex flex-col items-center justify-center top-0 h-full w-1/2 px-10 text-center transition-transform duration-700 ease-in-out ${
                isSignUp ? "translate-x-0" : "-translate-x-[20%]"
              }`}
            >
              <h1 className="text-2xl font-bold text-white">
                Already a member?
              </h1>
              <p className="text-sm my-5">
                Login and continue your journey with us.
              </p>
              <button
                onClick={() => setIsSignUp(false)}
                className="rounded-full border border-white bg-transparent text-white text-xs font-bold py-3 px-11 uppercase tracking-wider transition-transform active:scale-95 hover:bg-white hover:text-[#3E6272]"
              >
                Sign In
              </button>
            </div>

            {/* Right Panel */}
            <div
              className={`absolute right-0 flex flex-col items-center justify-center top-0 h-full w-1/2 px-10 text-center transition-transform duration-700 ease-in-out ${
                isSignUp ? "translate-x-[20%]" : "translate-x-0"
              }`}
            >
              <h1 className="text-2xl font-bold text-white">Hello, Friend!</h1>
              <p className="text-sm my-5">
                Enter your personal details and start your journey with us.
              </p>
              <button
                onClick={() => setIsSignUp(true)}
                className="rounded-full border border-white bg-transparent text-white text-xs font-bold py-3 px-11 uppercase tracking-wider transition-transform active:scale-95 hover:bg-white hover:text-[#3E6272]"
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
