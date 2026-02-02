import React, { useState, useEffect } from "react";
import { apiService } from "@/services/api";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiService.getUserProfile();
        setProfile(response.data.data); // your API nests data inside data.data
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, []);

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl p-10 rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-white/20 flex flex-col items-center text-center gap-6 animate-fade-in-up max-w-sm w-full">
        {/* Accent glow */}
        <div className="relative">
          <div className="absolute inset-0 bg-brand/20 blur-xl rounded-full animate-pulse"></div>
          <div className="relative bg-brand text-white p-4 rounded-2xl">
            <span className="text-2xl font-bold">{profile.name}</span>
          </div>
        </div>

        {/* Profile details */}
        <div className="flex flex-col gap-2 text-white">
          <p className="text-lg font-medium">@{profile.user_name}</p>
          <p className="text-sm opacity-80">{profile.email}</p>
          <p className="text-xs opacity-60">
            Verified: {new Date(profile.email_verified_at).toLocaleDateString()}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-4 mt-4">
          <button className="px-4 py-2 rounded-xl bg-brand text-white hover:bg-brand/80 transition">
            Edit Profile
          </button>
          <button className="px-4 py-2 rounded-xl border border-white/30 text-white hover:bg-white/10 transition">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
