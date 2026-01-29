import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { apiService, RideGroup, User } from "../services/api";
import { toast } from "react-toastify";
import {
  MapIcon,
  UserGroupIcon,
  ChatAlt2Icon,
  LocationMarkerIcon,
  ClockIcon,
  UserIcon,
  FilterIcon,
  StarIcon, // Added for visual relevance
} from "@heroicons/react/outline";

// Define Tab Types
type TabType = "all" | "relevant";

const RideGroupsPage: React.FC = () => {
  const [groups, setGroups] = useState<RideGroup[]>([]);
  // Use a derived state for the final display list rather than a separate state
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("all");

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

    // 1. Apply Standard Filters (Search, Members, etc)
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

    // 2. Sort: Relevant groups go to the TOP
    processed.sort((a, b) => {
      const aRel = isGroupRelevant(a);
      const bRel = isGroupRelevant(b);
      // If a is relevant and b is not, a comes first (-1)
      if (aRel && !bRel) return -1;
      if (!aRel && bRel) return 1;
      return 0;
    });

    // 3. Tab Filtering
    if (activeTab === "relevant") {
      processed = processed.filter((g) => isGroupRelevant(g));
    }

    return processed;
  }, [groups, filters, activeTab, currentUser, guestId]);

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
            <p className="text-gray-600 mt-1">Find your travel companions</p>
          </div>
          <button
            onClick={fetchGroups}
            className="mt-4 md:mt-0 px-4 py-2 bg-[#497487] text-white rounded-md hover:bg-[#546269] text-sm font-medium"
          >
            Refresh Groups
          </button>
        </div>

        {/* --- NEW TABS SECTION --- */}
        <div className="mt-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("all")}
              className={`${
                activeTab === "all"
                  ? "border-[#497487] text-[#497487]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              All Groups
              <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2.5 rounded-full text-xs">
                {groups.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("relevant")}
              className={`${
                activeTab === "relevant"
                  ? "border-[#497487] text-[#497487]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <StarIcon className="w-4 h-4 mr-1" />
              My Relevant Rides
              <span className="ml-2 bg-[#497487] text-white py-0.5 px-2.5 rounded-full text-xs">
                {groups.filter(isGroupRelevant).length}
              </span>
            </button>
          </nav>
        </div>
      </div>

      {/* Filters (Only show if not in Relevant tab, or keep for both) */}
      <div className="bg-white rounded-lg shadow-md p-4">
        {/* ... Keep your existing filters code exactly as is ... */}
        <div className="flex items-center mb-4">
          <FilterIcon className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="font-medium text-gray-900">Filter View</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Keep your existing filter inputs here (Min Members, Chat, Search) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Members
            </label>
            <select
              value={filters.minMembers}
              onChange={(e) =>
                setFilters({ ...filters, minMembers: Number(e.target.value) })
              }
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value={0}>Any size</option>
              <option value={2}>2+ members</option>
              <option value={3}>3+ members</option>
              <option value={5}>5+ members</option>
            </select>
          </div>

          {/* Search input logic from your original code... */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search..."
              value={filters.searchQuery}
              onChange={(e) =>
                setFilters({ ...filters, searchQuery: e.target.value })
              }
              className="w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {displayedGroups.length === 0 ? (
          <div className="col-span-2 bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-4xl mb-4">
              {activeTab === "relevant" ? "🔍" : "🚗"}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab === "relevant"
                ? "No relevant rides found"
                : "No groups found"}
            </h3>
            <p className="text-gray-600">
              {activeTab === "relevant"
                ? "We couldn't find a group containing your request. Try creating a ride request first."
                : "Try adjusting your filters or check back later."}
            </p>
          </div>
        ) : (
          displayedGroups.map((group) => {
            const isMyGroup = isGroupRelevant(group);

            return (
              <div
                key={group.group_id}
                className={`rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow relative ${
                  isMyGroup
                    ? "border-2 border-[#497487] bg-blue-50"
                    : "bg-white"
                }`}
              >
                {/* Relevance Badge */}
                {isMyGroup && (
                  <div className="absolute top-0 right-0 bg-[#497487] text-white text-xs px-2 py-1 rounded-bl-lg font-bold z-10">
                    MY RIDE
                  </div>
                )}

                <div className="p-6">
                  {/* Group Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {group.group_id.startsWith("group_") ? (
                          <span className="flex items-center">
                            <UserGroupIcon className="h-5 w-5 text-[#497487] mr-2" />
                            Group Ride
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <UserIcon className="h-5 w-5 text-gray-600 mr-2" />
                            Solo Ride
                          </span>
                        )}
                      </h3>
                      {/* ... Rest of your existing card content ... */}
                      <div className="flex items-center mt-1 text-sm text-gray-500">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        Created recently
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getDistanceColor(group.member_count)}`}
                    >
                      {group.member_count}{" "}
                      {group.member_count === 1 ? "rider" : "riders"}
                    </span>
                  </div>

                  {/* Route Information */}
                  <div className="mb-4">
                    <div className="flex items-center text-sm text-gray-700 mb-2">
                      <LocationMarkerIcon className="h-4 w-4 mr-2 text-green-600" />
                      <span className="font-medium">Pickup:</span>
                      <span className="ml-2">
                        {getGridDetails(group.pickup_grid)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <LocationMarkerIcon className="h-4 w-4 mr-2 text-red-600" />
                      <span className="font-medium">Dropoff:</span>
                      <span className="ml-2">
                        {getGridDetails(group.dropoff_grid)}
                      </span>
                    </div>
                  </div>

                  {/* Members */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Riders:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {group.members.slice(0, 3).map((member, index) => {
                        // Highlight current user/guest in member list
                        const isMe =
                          (currentUser && member.user_id === currentUser.id) ||
                          (guestId && String(member.id) === String(guestId));

                        return (
                          <span
                            key={index}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              isMe
                                ? "bg-[#497487] text-white ring-2 ring-offset-1 ring-[#497487]"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {member.user_name} {isMe && "(You)"}
                          </span>
                        );
                      })}
                      {group.member_count > 3 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                          +{group.member_count - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      <MapIcon className="h-4 w-4 inline mr-1" />
                      Meetup: {group.meetup_point.name}
                    </div>

                    {group.chat_room_id ? (
                      <Link
                        to={`/chat/${group.chat_room_id}`}
                        className="inline-flex items-center px-4 py-2 bg-[#497487] text-white text-sm font-medium rounded-md hover:bg-[#546269]"
                      >
                        <ChatAlt2Icon className="h-4 w-4 mr-2" />
                        Join Chat
                      </Link>
                    ) : (
                      <span className="text-sm text-gray-500">
                        Chat not available
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Keep Stats Section ... */}
    </div>
  );
};

export default RideGroupsPage;
