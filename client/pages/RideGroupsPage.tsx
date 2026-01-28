// src/pages/RideGroupsPage.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiService, RideGroup } from "../services/api";
import { toast } from "react-toastify";
import {
  MapIcon,
  UserGroupIcon,
  ChatAlt2Icon,
  LocationMarkerIcon,
  ClockIcon,
  UsersIcon,
  FilterIcon,
} from "@heroicons/react/outline";

const RideGroupsPage: React.FC = () => {
  const [groups, setGroups] = useState<RideGroup[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<RideGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    minMembers: 0,
    hasChat: "all",
    searchQuery: "",
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [groups, filters]);

  const fetchGroups = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getGroupedRides();
      setGroups(response.data.groups);
    } catch (error) {
      toast.error("Failed to load ride groups");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...groups];

    // Filter by member count
    if (filters.minMembers > 0) {
      filtered = filtered.filter(
        (group) => group.member_count >= filters.minMembers,
      );
    }

    // Filter by chat availability
    if (filters.hasChat === "hasChat") {
      filtered = filtered.filter((group) => group.chat_room_id !== null);
    } else if (filters.hasChat === "noChat") {
      filtered = filtered.filter((group) => group.chat_room_id === null);
    }

    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (group) =>
          group.pickup_grid.toLowerCase().includes(query) ||
          group.dropoff_grid.toLowerCase().includes(query) ||
          group.members.some((member) =>
            member.user_name.toLowerCase().includes(query),
          ),
      );
    }

    setFilteredGroups(filtered);
  };

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
              Groups are automatically created based on 1-mile proximity in both
              pickup and dropoff locations
            </p>
          </div>
          <button
            onClick={fetchGroups}
            className="mt-4 md:mt-0 px-4 py-2 bg-[#497487] text-white rounded-md hover:bg-[#546269] text-sm font-medium"
          >
            Refresh Groups
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center mb-4">
          <FilterIcon className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="font-medium text-gray-900">Filter Groups</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chat Availability
            </label>
            <select
              value={filters.hasChat}
              onChange={(e) =>
                setFilters({ ...filters, hasChat: e.target.value })
              }
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All groups</option>
              <option value="hasChat">With chat room</option>
              <option value="noChat">Without chat room</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by grid or name..."
              value={filters.searchQuery}
              onChange={(e) =>
                setFilters({ ...filters, searchQuery: e.target.value })
              }
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredGroups.length === 0 ? (
          <div className="col-span-2 bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-4xl mb-4">🚗</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No groups found
            </h3>
            <p className="text-gray-600">
              Try adjusting your filters or check back later for new ride groups
            </p>
          </div>
        ) : (
          filteredGroups.map((group) => (
            <div
              key={group.group_id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
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
                    Riders in this group:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {group.members.slice(0, 3).map((member, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {member.user_name}
                      </span>
                    ))}
                    {group.member_count > 3 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                        +{group.member_count - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
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
          ))
        )}
      </div>

      {/* Stats */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {groups.length}
            </div>
            <div className="text-sm text-gray-600">Total Groups</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {groups.filter((g) => g.chat_room_id).length}
            </div>
            <div className="text-sm text-gray-600">With Chat Rooms</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {groups.reduce((acc, g) => acc + g.member_count, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Riders</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(
                groups.reduce((acc, g) => acc + g.member_count, 0) /
                  (groups.length || 1),
              )}
            </div>
            <div className="text-sm text-gray-600">Avg. Group Size</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add missing import
import { UserIcon } from "@heroicons/react/outline";

export default RideGroupsPage;
