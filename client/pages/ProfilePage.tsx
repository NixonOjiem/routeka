import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiService, updateUserProfile } from "@/services/api"; // Added updateUserProfile import
import { useDispatch } from "react-redux";
import { logout, reset } from "@/redux/slices/authSlice";
import { AppDispatch } from "@/redux/store";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  CheckCircle,
  Calendar,
  Edit3,
  Settings,
  Shield,
  LogOut,
  MapPin,
  Phone,
  ExternalLink,
  AlertTriangle,
  Globe,
  Sparkles,
  Zap,
  Bell,
  CreditCard,
  Download,
  Eye,
  Key,
  ShieldCheck,
  Crown,
  X,
  Save,
  Loader2,
  AtSign,
} from "lucide-react";

// --- Skeleton Loader (Unchanged) ---
const ProfileSkeleton = () => (
  <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
    <div className="flex flex-col gap-4">
      <div className="h-10 w-80 bg-gradient-to-r from-brand/10 to-brand/5 rounded-xl animate-pulse"></div>
      <div className="h-4 w-60 bg-stone-200 rounded animate-pulse"></div>
    </div>
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="lg:w-1/3">
        <div className="bg-white rounded-3xl p-8 shadow-lg animate-pulse">
          <div className="flex flex-col items-center gap-6">
            <div className="w-32 h-32 bg-brand/10 rounded-3xl"></div>
            <div className="space-y-3 w-full">
              <div className="h-6 bg-stone-200 rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-stone-200 rounded w-1/2 mx-auto"></div>
            </div>
            <div className="grid grid-cols-3 gap-4 w-full">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-stone-100 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="lg:w-2/3">
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 bg-white rounded-2xl animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// --- Animated Card Component (Unchanged) ---
const AnimatedCard = ({ children, className = "", delay = 0 }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className={className}
  >
    {children}
  </motion.div>
);

// --- Info Card Component (Unchanged) ---
const InfoCard = ({
  icon: Icon,
  label,
  value,
  subtext,
  verified,
  onClick,
  className = "",
}: any) => (
  <motion.div
    whileHover={{ y: -4, scale: 1.02 }}
    className={`group p-6 rounded-3xl border border-stone-100 bg-white hover:shadow-xl hover:border-brand/30 
                transition-all duration-300 cursor-pointer transform-gpu ${className}`}
    onClick={onClick}
  >
    <div className="flex items-start gap-4">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-brand/20 to-transparent rounded-xl blur-sm"></div>
        <div
          className="relative p-3 rounded-xl bg-gradient-to-br from-brand/5 to-brand/10 
                        group-hover:from-brand/10 group-hover:to-brand/20 transition-colors"
        >
          <Icon
            className="text-brand group-hover:scale-110 transition-transform"
            size={24}
          />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold uppercase tracking-wider text-stone-400 mb-2">
          {label}
        </p>
        <p className="text-lg font-bold text-stone-900 truncate">
          {value || "Not provided"}
        </p>
        {verified && (
          <div className="flex items-center gap-2 mt-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 rounded-full">
              <CheckCircle size={14} className="text-green-500" />
              <span className="text-xs font-medium text-green-600">
                {subtext}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  </motion.div>
);

// --- Edit Modal Component ---
const EditProfileModal = ({ isOpen, onClose, user, onSave, isSaving }: any) => {
  const [localFormData, setLocalFormData] = useState({
    name: "",
    user_name: "",
    email: "", // Often read-only in many apps, but included here
  });

  useEffect(() => {
    if (user) {
      setLocalFormData({
        name: user.name || "",
        user_name: user.user_name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalFormData({ ...localFormData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localFormData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand/10 rounded-xl">
                    <Edit3 size={20} className="text-brand" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-900">
                    Edit Profile
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                      />
                      <input
                        type="text"
                        name="name"
                        value={localFormData.name}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition-all"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Username
                    </label>
                    <div className="relative">
                      <AtSign
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                      />
                      <input
                        type="text"
                        name="user_name"
                        value={localFormData.user_name}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition-all"
                        placeholder="username"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                      />
                      <input
                        type="email"
                        name="email"
                        value={localFormData.email}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 px-4 rounded-xl font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-brand to-brand/80 hover:shadow-lg hover:shadow-brand/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// --- Main Component ---
export default function ProfilePage() {
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // New State for Editing
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const onLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      dispatch(reset());
      navigate("/");
    } catch (error) {
      dispatch(reset());
      navigate("/");
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await apiService.getUserProfile();
      setProfile(response.data.data);
      // Optional: Don't toast on initial load, only on updates
      // toast.success("✨ Profile loaded successfully!");
    } catch (err) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // --- Handle Update Logic ---
  const handleUpdateProfile = async (updatedData: any) => {
    setIsSaving(true);
    try {
      // Call your API function
      const response = await updateUserProfile(updatedData);

      // Update local state immediately (Optimistic UI or based on response)
      setProfile((prev: any) => ({
        ...prev,
        ...updatedData,
        // If your API returns the updated user object, use that instead:
        // ...response.user
      }));

      toast.success("Profile updated successfully! ✨");
      setIsEditing(false); // Close modal
    } catch (error: any) {
      console.error(error);
      const errorMessage =
        error?.response?.data?.message || "Failed to update profile";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <ProfileSkeleton />;

  return (
    <>
      <div className="bg-gradient-to-b from-brand/5 via-white to-brand/2 min-h-screen pb-12">
        {/* ... Header and Decorative Elements (Unchanged) ... */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-brand/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="relative overflow-hidden rounded-b-[2.5rem] shadow-lg">
          <div className="h-64 bg-gradient-to-r from-brand via-brand/90 to-brand/80 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20 pointer-events-none"></div>
            <h1 className="relative z-10 text-6xl font-extrabold text-white tracking-tight drop-shadow-md">
              My Profile
            </h1>
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-8 left-8">
          <div className="flex items-center gap-2 text-white/90">
            <Sparkles size={20} />
            <span className="text-sm font-medium">Premium Member</span>
          </div>
        </div>

        <div className="absolute top-8 right-8">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30 transition-colors">
            <Settings size={18} />
            <span className="text-sm font-medium">Settings</span>
          </button>
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-16 relative z-10">
          <AnimatedCard delay={0.1}>
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Column: Profile Overview */}
              <div className="lg:w-2/5">
                <div className="bg-white rounded-3xl shadow-2xl shadow-brand/10 border border-brand/20 backdrop-blur-sm p-8 sticky top-8">
                  {/* Avatar Section */}
                  <div className="relative mb-8">
                    <div className="absolute -inset-4 bg-gradient-to-r from-brand/30 to-brand/10 rounded-3xl blur-xl opacity-70"></div>
                    <div className="relative w-40 h-40 mx-auto bg-gradient-to-br from-brand to-brand/70 rounded-3xl flex items-center justify-center text-5xl font-bold text-white border-8 border-white shadow-2xl overflow-hidden">
                      {profile?.avatar ? (
                        <img
                          src={profile.avatar}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        profile?.name?.[0]
                      )}
                    </div>
                  </div>

                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-stone-900 mb-2">
                      {profile?.name}
                    </h2>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-brand font-semibold">
                        @{profile?.user_name}
                      </span>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>

                  {/* Action Buttons - UPDATED */}
                  <div className="space-y-4">
                    <button
                      onClick={() => setIsEditing(true)} // Changed to open Modal
                      className="w-full bg-gradient-to-r from-brand to-brand/80 text-white py-4 
                               rounded-2xl font-semibold hover:shadow-lg hover:shadow-brand/20 
                               transition-all flex items-center justify-center gap-3 group"
                    >
                      <Edit3 size={20} />
                      Edit Profile
                    </button>
                  </div>

                  {/* Stats (Unchanged) */}
                  <div className="mt-8 pt-8 border-t border-stone-100">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-stone-600">
                        Profile Strength
                      </span>
                      <span className="text-sm font-bold text-brand">98%</span>
                    </div>
                    <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-brand to-brand/70 rounded-full w-[98%] animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Detailed Information */}
              <div className="lg:w-3/5">
                {/* Tabs */}
                <div className="flex gap-2 mb-8 p-2 bg-white rounded-2xl shadow-lg border border-stone-100 backdrop-blur-sm w-fit">
                  {[
                    {
                      id: "overview",
                      label: "Overview",
                      icon: <User size={18} />,
                    },
                    {
                      id: "security",
                      label: "Security",
                      icon: <ShieldCheck size={18} />,
                    },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                        activeTab === tab.id
                          ? "bg-gradient-to-r from-brand to-brand/80 text-white shadow-md"
                          : "text-stone-600 hover:text-brand hover:bg-brand/5"
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {activeTab === "overview" && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-6"
                    >
                      <div className="grid md:grid-cols-2 gap-4">
                        <InfoCard
                          icon={Mail}
                          label="Email Address"
                          value={profile?.email}
                          verified
                          subtext="Verified"
                        />
                        <InfoCard
                          icon={AtSign}
                          label="Username"
                          value={profile?.user_name}
                          subtext="Public display name"
                        />
                        <InfoCard
                          icon={Calendar}
                          label="Verified Since"
                          value={
                            profile?.email_verified_at
                              ? `${new Intl.DateTimeFormat("en-US", {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                }).format(new Date(profile.email_verified_at))}`
                              : "Not verified"
                          }
                          subtext="Active Member"
                        />
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "security" && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div className="grid md:grid-cols-2 gap-4">
                        <AnimatedCard delay={0}>
                          <div className="p-6 bg-white rounded-2xl border border-stone-100 hover:border-brand/30 transition-colors cursor-pointer">
                            <div className="flex items-center justify-between mb-4">
                              <div className="p-3 rounded-xl bg-brand/10">
                                <Shield className="text-brand" size={24} />
                              </div>
                              <span className="text-sm font-medium text-brand bg-brand/10 px-3 py-1 rounded-full">
                                Update
                              </span>
                            </div>
                            <h4 className="font-bold text-stone-900 mb-2">
                              Change Password
                            </h4>
                            <p className="text-sm text-stone-500">
                              Manage your account security settings
                            </p>
                          </div>
                        </AnimatedCard>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Quick Actions */}
                <AnimatedCard delay={0.3}>
                  <div className="mt-8 p-6 bg-gradient-to-r from-brand/10 to-transparent rounded-3xl border border-brand/20">
                    <h4 className="text-lg font-bold text-stone-900 mb-4">
                      Quick Actions
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={onLogout}
                        className="px-5 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-all flex items-center gap-2"
                      >
                        <LogOut size={18} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </AnimatedCard>
              </div>
            </div>
          </AnimatedCard>
        </div>
      </div>

      {/* --- EDIT MODAL --- */}
      <EditProfileModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        user={profile}
        onSave={handleUpdateProfile}
        isSaving={isSaving}
      />
    </>
  );
}
