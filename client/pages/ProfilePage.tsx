import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "@/services/api";
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
} from "lucide-react";

// --- Skeleton Loader ---
const ProfileSkeleton = () => (
  <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
    {/* Header Skeleton */}
    <div className="flex flex-col gap-4">
      <div className="h-10 w-80 bg-linear-to-r from-brand/10 to-brand/5 rounded-xl animate-pulse"></div>
      <div className="h-4 w-60 bg-stone-200 rounded animate-pulse"></div>
    </div>

    <div className="flex flex-col lg:flex-row gap-8">
      {/* Left Column Skeleton */}
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

      {/* Right Column Skeleton */}
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

// --- Animated Card Component ---
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

// --- Info Card Component ---
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
        <div className="absolute inset-0 bg-linear-to-br from-brand/20 to-transparent rounded-xl blur-sm"></div>
        <div
          className="relative p-3 rounded-xl bg-linear-to-br from-brand/5 to-brand/10 
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
            {subtext.includes("Verified") && (
              <span className="text-xs text-stone-400">• Just now</span>
            )}
          </div>
        )}
      </div>
    </div>
  </motion.div>
);

// --- Main Component ---
export default function ProfilePage() {
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>(); // 2. Initialize dispatch
  const onLogout = async () => {
    try {
      // 3. Use the Redux action instead of the direct api call
      await dispatch(logout()).unwrap();
      dispatch(reset());
      navigate("/");
    } catch (error) {
      // Even if the API call fails, we want to clear local state
      dispatch(reset());
      navigate("/");
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiService.getUserProfile();
        setProfile(response.data.data);
        toast.success("✨ Profile loaded successfully!");
      } catch (err) {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <ProfileSkeleton />;

  return (
    <>
      <div className="bg-linear-to-b from-brand/5 via-white to-brand/2">
        {/* Decorative Elements */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-brand/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>

        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-b-[2.5rem] shadow-lg">
          {/* Main Background Container */}
          <div className="h-64 bg-linear-to-r from-brand via-brand/90 to-brand/80 flex items-center justify-center relative">
            {/* SVG Pattern Overlay - Using pointer-events-none so it doesn't interfere with clicks */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20 pointer-events-none"></div>

            {/* Centered Heading */}
            <h1 className="relative z-10 text-6xl font-extrabold text-white tracking-tight drop-shadow-md">
              My Profile
            </h1>

            {/* Bottom Inner Shadow for Depth */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-black/10 to-transparent pointer-events-none"></div>
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
          <button
            className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl 
                           text-white hover:bg-white/30 transition-colors"
          >
            <Settings size={18} />
            <span className="text-sm font-medium">Settings</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-16 relative z-10">
        {/* Main Profile Card */}
        <AnimatedCard delay={0.1}>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column: Profile Overview */}
            <div className="lg:w-2/5">
              <div
                className="bg-white rounded-3xl shadow-2xl shadow-brand/10 border border-brand/20 
                            backdrop-blur-sm p-8 sticky top-8"
              >
                {/* Profile Avatar */}
                <div className="relative mb-8">
                  <div
                    className="absolute -inset-4 bg-linear-to-r from-brand/30 to-brand/10 rounded-3xl 
                                blur-xl opacity-70"
                  ></div>
                  <div
                    className="relative w-40 h-40 mx-auto bg-linear-to-br from-brand to-brand/70 
                                rounded-3xl flex items-center justify-center text-5xl font-bold text-white 
                                border-8 border-white shadow-2xl overflow-hidden"
                  >
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

                {/* Profile Info */}
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

                {/* Action Buttons */}
                <div className="space-y-4">
                  <button
                    onClick={() => navigate("/profile/edit")}
                    className="w-full bg-linear-to-r from-brand to-brand/80 text-white py-4 
                              rounded-2xl font-semibold hover:shadow-lg hover:shadow-brand/20 
                              transition-all flex items-center justify-center gap-3 group"
                  >
                    <Edit3 size={20} />
                    Edit Profile
                    <ExternalLink
                      size={16}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </button>
                </div>

                {/* Quick Stats */}
                <div className="mt-8 pt-8 border-t border-stone-100">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-stone-600">
                      Profile Strength
                    </span>
                    <span className="text-sm font-bold text-brand">98%</span>
                  </div>
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-brand to-brand/70 rounded-full 
                                  w-[98%] animate-pulse"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Detailed Information */}
            <div className="lg:w-3/5">
              {/* Tab Navigation */}
              <div
                className="flex gap-2 mb-8 p-2 bg-white rounded-2xl shadow-lg border border-stone-100 
                            backdrop-blur-sm w-fit"
              >
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
                        ? "bg-linear-to-r from-brand to-brand/80 text-white shadow-md"
                        : "text-stone-600 hover:text-brand hover:bg-brand/5"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {/* Overview Tab */}
                {activeTab === "overview" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    {/* Personal Information Grid */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <InfoCard
                        icon={Mail}
                        label="Email Address"
                        value={profile?.email}
                        verified
                        subtext="Verified"
                        onClick={() => toast.info("Click to update email")}
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
                        subtext="2 years active"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Security Tab */}
                {activeTab === "security" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Security Actions */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        {
                          icon: Shield,
                          label: "Change Password",
                          action: "Update",
                        },
                      ].map((item, index) => (
                        <AnimatedCard key={index} delay={index * 0.1}>
                          <div
                            className="p-6 bg-white rounded-2xl border border-stone-100 
                                        hover:border-brand/30 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div className="p-3 rounded-xl bg-brand/10">
                                <item.icon className="text-brand" size={24} />
                              </div>
                              <span
                                className="text-sm font-medium text-brand bg-brand/10 
                                             px-3 py-1 rounded-full"
                              >
                                {item.action}
                              </span>
                            </div>
                            <h4 className="font-bold text-stone-900 mb-2">
                              {item.label}
                            </h4>
                            <p className="text-sm text-stone-500">
                              Manage your account security settings
                            </p>
                          </div>
                        </AnimatedCard>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Quick Actions Bar */}
              <AnimatedCard delay={0.3}>
                <div
                  className="mt-8 p-6 bg-linear-to-r from-brand/10 to-transparent 
                              rounded-3xl border border-brand/20"
                >
                  <h4 className="text-lg font-bold text-stone-900 mb-4">
                    Quick Actions
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => onLogout()}
                      className="px-5 py-2.5 bg-white border border-red-200 text-red-600 
                                      rounded-xl hover:bg-red-50 transition-all flex items-center gap-2"
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
    </>
  );
}
