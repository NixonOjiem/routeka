import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { apiService, RideGroup, User } from "../services/api";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useNavigate } from "react-router-dom";
import {
  MapIcon,
  UserGroupIcon,
  ChatAlt2Icon,
  // LocationMarkerIcon,
  ClockIcon,
  UsersIcon,
  SearchIcon,
  StarIcon,
  UserIcon,
  BriefcaseIcon, // Corporate
  HomeIcon, // Neighborhood
  AcademicCapIcon, // University
  CalendarIcon, // Events
  SparklesIcon, // Suggested
} from "@heroicons/react/outline";

// Define Tab Types
type TabType =
  | "my_rides"
  | "suggested"
  | "corporate"
  | "neighborhood"
  | "university"
  | "events";

const RideGroupsPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [groups, setGroups] = useState<RideGroup[]>([]);
  // Use a derived state for the final display list rather than a separate state
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("suggested");
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    minMembers: 0,
    hasChat: "all",
    searchQuery: "",
  });

  // Get identities from storage
  const guestId = localStorage.getItem("chat_guest_id");

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getGroupedRides();
      setGroups(response.data.groups);
      if (response.data.user) {
        setCurrentUser(response.data.user);
      }
    } catch (error) {
      toast.error("Failed to load ride groups");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to check if a specific group belongs to the current user/guest
  const isGroupRelevant = (group: RideGroup) => {
    return group.members.some((member) => {
      // 1. Check by Auth User ID
      if (currentUser && member.user_id === currentUser.id) return true;

      // 2. Check by Guest ID (Assuming chat_guest_id matches the Ride Request ID)
      // We convert both to strings to ensure loose matching (e.g. "5" vs 5)
      if (guestId && String(member.guest_id) === String(guestId)) return true;

      return false;
    });
  };

  // Process groups: Filter -> Sort (Relevant first) -> Tab Filter
  const displayedGroups = useMemo(() => {
    let processed = [...groups];

    // 1. FILTER BY TAB (Category)
    if (activeTab === "my_rides") {
      processed = processed.filter(isGroupRelevant);
    } else {
      // Filter by the group_type returned from backend
      processed = processed.filter((g) => g.group_type === activeTab);
    }

    // 2. STANDARD FILTERS
    if (filters.minMembers > 0) {
      processed = processed.filter((g) => g.member_count >= filters.minMembers);
    }
    if (filters.hasChat === "hasChat") {
      processed = processed.filter((g) => g.chat_room_id !== null);
    } else if (filters.hasChat === "noChat") {
      processed = processed.filter((g) => g.chat_room_id === null);
    }
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      processed = processed.filter(
        (g) =>
          g.pickup_grid.toLowerCase().includes(query) ||
          g.dropoff_grid.toLowerCase().includes(query) ||
          g.members.some((m) => m.user_name.toLowerCase().includes(query)),
      );
    }

    return processed;
  }, [groups, filters, activeTab, currentUser, guestId]);

  // Tab Configuration for UI rendering
  const tabs = [
    {
      id: "suggested",
      label: "Suggested",
      icon: SparklesIcon,
      color: "text-purple-600",
    },
    {
      id: "corporate",
      label: "Corporate",
      icon: BriefcaseIcon,
      color: "text-blue-600",
    },
    {
      id: "neighborhood",
      label: "Neighborhood",
      icon: HomeIcon,
      color: "text-green-600",
    },
    {
      id: "university",
      label: "University",
      icon: AcademicCapIcon,
      color: "text-orange-600",
    },
    {
      id: "events",
      label: "Events",
      icon: CalendarIcon,
      color: "text-pink-600",
    },
    {
      id: "my_rides",
      label: "My Rides",
      icon: StarIcon,
      color: "text-yellow-600",
    },
  ];

  const getGridDetails = (grid: string) => {
    const [lat, lng] = grid.split("_").map(Number);
    const latDir = lat >= 0 ? "N" : "S";
    const lngDir = lng >= 0 ? "E" : "W";
    return `${Math.abs(lat)}°${latDir}, ${Math.abs(lng)}°${lngDir}`;
  };

  const getDistanceColor = (memberCount: number) => {
    if (memberCount >= 4) return "bg-green-100 text-green-800";
    if (memberCount >= 2) return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#546269]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ride Groups</h1>
            <p className="text-gray-600 mt-1">
              Find travel companions in your network
            </p>
          </div>
          <button
            onClick={fetchGroups}
            className="mt-4 md:mt-0 px-4 py-2 bg-brand text-white rounded-md hover:bg-[#546269] text-sm font-medium"
          >
            Refresh
          </button>
        </div>

        {/* --- NEW TABS SECTION --- */}
        {/* --- DYNAMIC TABS SECTION --- */}
        <div className="mt-6 border-b border-gray-200 overflow-x-auto">
          <nav className="-mb-px flex space-x-6">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;

              // Calculate count for badge
              const count =
                tab.id === "my_rides"
                  ? groups.filter(isGroupRelevant).length
                  : groups.filter((g) => g.group_type === tab.id).length;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`${
                    isActive
                      ? "border-[#497487] text-[#497487]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors`}
                >
                  <tab.icon
                    className={`w-4 h-4 mr-2 ${isActive ? tab.color : ""}`}
                  />
                  {tab.label}
                  <span
                    className={`ml-2 py-0.5 px-2.5 rounded-full text-xs ${
                      isActive
                        ? "bg-[#497487] text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#ffffff] border border-slate-200 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] overflow-hidden">
        <div className="flex flex-col lg:flex-row items-stretch">
          {/* Section 1: The Search Command */}
          <div className="grow p-4 lg:p-6 border-b lg:border-b-0 lg:border-r border-slate-100">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-slate-300 group-focus-within:text-slate-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search grid or rider name..."
                value={filters.searchQuery}
                onChange={(e) =>
                  setFilters({ ...filters, searchQuery: e.target.value })
                }
                className="block w-full pl-11 pr-4 py-3 bg-slate-50 outline-none border-none rounded-xl text-sm"
              />
            </div>
          </div>

          {/* Section 2: Capacity Filter */}
          <div className="w-full lg:w-64 p-4 lg:p-6 border-b lg:border-b-0 lg:border-r border-slate-100 bg-slate-50/30">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2 px-1">
              Group Capacity
            </label>
            <div className="relative">
              <select
                value={filters.minMembers}
                onChange={(e) =>
                  setFilters({ ...filters, minMembers: Number(e.target.value) })
                }
                className="appearance-none w-full bg-white border border-slate-200 rounded-xl py-3 pl-4 pr-10 text-sm font-medium text-slate-600 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all cursor-pointer"
              >
                <option value={0}>Any Size</option>
                <option value={2}>2+ Members</option>
                <option value={3}>3+ Members</option>
                <option value={5}>5+ Members</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <UsersIcon className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Section 3: Connection Filter */}
          <div className="w-full lg:w-72 p-4 lg:p-6 flex flex-col justify-center">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-3 px-1">
              Communication
            </label>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {[
                { id: "all", label: "All", icon: null },
                { id: "hasChat", label: "Group", icon: ChatAlt2Icon },
                { id: "noChat", label: "Solo", icon: null },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setFilters({ ...filters, hasChat: option.id })}
                  className={`flex-1 flex items-center justify-center space-x-1 py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                    filters.hasChat === option.id
                      ? "bg-white text-slate-600 shadow-sm ring-1 ring-black/5"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {option.icon && <option.icon className="h-3 w-3" />}
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {displayedGroups.length === 0 ? (
          <div className="col-span-2 bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-4xl mb-4">
              {activeTab === "suggested" ? <SparklesIcon /> : <UserGroupIcon />}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {activeTab.replace("_", " ")} groups found
            </h3>
            <p className="text-gray-500">
              {activeTab === "my_rides"
                ? "You haven't joined any ride requests yet."
                : "Try switching tabs or adjusting your filters."}
            </p>
          </div>
        ) : (
          displayedGroups.map((group) => (
            <div
              key={group.group_id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border-l-4"
              style={{
                borderLeftColor:
                  group.group_type === "corporate"
                    ? "#2563EB"
                    : group.group_type === "neighborhood"
                      ? "#16A34A"
                      : group.group_type === "university"
                        ? "#EA580C"
                        : group.group_type === "events"
                          ? "#DB2777"
                          : "#9333EA", // Default/Suggested
              }}
            >
              <div className="p-6">
                {/* Group Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      {/* Dynamic Icon based on Group Type */}
                      {group.group_type === "corporate" && (
                        <BriefcaseIcon className="h-5 w-5 text-blue-500 mr-2" />
                      )}
                      {group.group_type === "neighborhood" && (
                        <HomeIcon className="h-5 w-5 text-green-500 mr-2" />
                      )}
                      {group.group_type === "university" && (
                        <AcademicCapIcon className="h-5 w-5 text-orange-500 mr-2" />
                      )}
                      {group.group_type === "suggested" && (
                        <SparklesIcon className="h-5 w-5 text-purple-500 mr-2" />
                      )}
                      {![
                        "corporate",
                        "neighborhood",
                        "university",
                        "suggested",
                      ].includes(group.group_type) &&
                        (group.group_id.startsWith("group_") ? (
                          <UserGroupIcon className="h-5 w-5 text-brand mr-2" />
                        ) : (
                          <UserIcon className="h-5 w-5 text-gray-600 mr-2" />
                        ))}

                      <span className="capitalize">
                        {group.group_type || "Ride"} Group
                      </span>
                    </h3>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      Grid: {group.pickup_grid} → {group.dropoff_grid}
                    </div>
                  </div>

                  {/* Badge for Group Size */}
                  <span
                    className={`px-2 py-1 rounded-md text-xs font-bold ${
                      group.member_count > 1
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {group.member_count > 1
                      ? `${group.member_count} Riders`
                      : "Solo"}
                  </span>
                </div>

                {/* Members List */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Riders:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {group.members.slice(0, 3).map((member, index) => {
                      const isMe =
                        (currentUser && member.user_id === currentUser.id) ||
                        (guestId && String(member.id) === String(guestId));

                      return (
                        <span
                          key={index}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            isMe
                              ? "bg-[#497487] text-white border-[#497487] ring-2 ring-offset-1 ring-[#497487]"
                              : "bg-white text-gray-700 border-gray-200"
                          }`}
                        >
                          {member.user_name} {isMe && "(You)"}
                          {group.group_type === "suggested" && (
                            <span className="ml-1 text-[9px] opacity-75 uppercase">
                              (
                              {member.category
                                ? member.category.substring(0, 3)
                                : "UNK"}
                              )
                            </span>
                          )}
                        </span>
                      );
                    })}
                    {group.member_count > 3 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        +{group.member_count - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions (Integrated with your original Auth Logic) */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-500 truncate mr-2">
                    <MapIcon className="h-4 w-4 inline mr-1" />
                    {group.meetup_point.name}
                  </div>

                  {group.chat_room_id ? (
                    !user ? (
                      <button
                        onClick={() => navigate("/signin")}
                        className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-md hover:bg-gray-200 transition-colors"
                      >
                        <ChatAlt2Icon className="h-4 w-4 mr-1" /> Sign in
                      </button>
                    ) : !user.email_verified_at ? (
                      <button
                        onClick={() =>
                          toast.warning(
                            "Please verify your email to join the chat.",
                          )
                        }
                        className="inline-flex items-center px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-medium rounded-md hover:bg-amber-100 transition-colors"
                        title="Check your email for verification"
                      >
                        <ChatAlt2Icon className="h-4 w-4 mr-1" /> Verify
                      </button>
                    ) : (
                      <Link
                        to={`/chat/${group.chat_room_id}`}
                        className="inline-flex items-center px-3 py-1.5 bg-brand text-white text-xs font-medium rounded-md hover:bg-[#546269] transition-colors"
                      >
                        <ChatAlt2Icon className="h-4 w-4 mr-1" /> Join Chat
                      </Link>
                    )
                  ) : (
                    <span className="text-xs text-gray-500 italic">
                      No Chat
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-600">
              {groups.length}
            </div>
            <div className="text-sm text-gray-600">Total Groups</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {groups.filter((g) => g.chat_room_id).length}
            </div>
            <div className="text-sm text-gray-600">With Chat</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {groups.reduce((acc, g) => acc + (g.member_count || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Total Riders</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(
                groups.reduce((acc, g) => acc + (g.member_count || 0), 0) /
                  (groups.length || 1),
              )}
            </div>
            <div className="text-sm text-gray-600">Avg. Size</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RideGroupsPage;
