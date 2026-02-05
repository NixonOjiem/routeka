import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiService, RideGroup, User } from "../services/api";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  MapIcon,
  UserGroupIcon,
  ChatAlt2Icon,
  ClockIcon,
  BriefcaseIcon,
  HomeIcon,
  AcademicCapIcon,
  CalendarIcon,
  SparklesIcon,
  StarIcon,
  ExclamationCircleIcon,
  LockClosedIcon,
  LocationMarkerIcon,
  ChevronRightIcon,
  RefreshIcon,
} from "@heroicons/react/outline";
import { CheckCircleIcon } from "@heroicons/react/solid"; // Solid icons for status

type TabType =
  | "my_rides"
  | "suggested"
  | "corporate"
  | "neighborhood"
  | "university"
  | "events";

// --- Helper Components ---

// Visualizes the A -> B route nicely
const RouteVisualizer = ({ from, to }: { from: string; to: string }) => (
  <div className="flex flex-col space-y-1 relative pl-4 border-l-2 border-gray-200 ml-2 py-1">
    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-indigo-500" />
    <div className="absolute -left-[9px] bottom-0 w-4 h-4 rounded-full bg-indigo-500" />
    <div className="text-sm text-gray-500 font-medium leading-none mb-4 -mt-1">
      {from}
    </div>
    <div className="text-sm text-gray-900 font-bold leading-none">{to}</div>
  </div>
);

// Renders a stack of user avatars (or initials)
const MemberStack = ({ members }: { members: any[] }) => (
  <div className="flex -space-x-2 overflow-hidden">
    {members.slice(0, 4).map((m, i) => (
      <div
        key={i}
        className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 uppercase"
        title={m.user_name}
      >
        {m.user_name?.charAt(0) || "?"}
      </div>
    ))}
    {members.length > 4 && (
      <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-xs text-gray-500">
        +{members.length - 4}
      </div>
    )}
  </div>
);

// --- Main Component ---

const RideGroupsPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [groups, setGroups] = useState<RideGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("my_rides");
  const navigate = useNavigate();
  const guestId = localStorage.getItem("chat_guest_id");

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getGroupedRides();
      setGroups(response.data.groups);
      if (response.data.user) setCurrentUser(response.data.user);
    } catch (error) {
      toast.error("Failed to load ride groups");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to format the grid object into a string
  const formatGrid = (grid: any) => {
    // 1. If we have a human-readable name, use it
    if (grid?.name && grid.name !== "Unknown Area") {
      return grid.name;
    }

    // 2. Handle legacy string format
    if (typeof grid === "string") return grid;

    // 3. Fallback to coordinates if lat/lng exist
    if (grid?.lat && grid?.lng) {
      return `${Number(grid.lat).toFixed(4)}, ${Number(grid.lng).toFixed(4)}`;
    }

    return "Unknown Location";
  };

  const isGroupRelevant = (group: RideGroup) => {
    return group.members.some((member) => {
      if (currentUser && member.user_id === currentUser.id) return true;
      if (guestId && String(member.id) === String(guestId)) return true;
      return false;
    });
  };

  // Helper to find currentUser's ride ID
  const getUserRideId = (group: RideGroup) => {
    const member = group.members.find(
      (m) =>
        (currentUser && m.user_id === currentUser.id) ||
        (guestId && String(m.id) === String(guestId)),
    );
    return member ? member.id : null;
  };

  const tabs = [
    {
      id: "my_rides",
      label: "My Requests",
      icon: StarIcon,
      color: "text-yellow-500",
    },
    {
      id: "corporate",
      label: "Corporate",
      icon: BriefcaseIcon,
      color: "text-blue-500",
    },
    {
      id: "neighborhood",
      label: "Neighborhood",
      icon: HomeIcon,
      color: "text-green-500",
    },
    {
      id: "university",
      label: "University",
      icon: AcademicCapIcon,
      color: "text-orange-500",
    },
    {
      id: "events",
      label: "Events",
      icon: CalendarIcon,
      color: "text-pink-500",
    },
    {
      id: "suggested",
      label: "Suggested",
      icon: SparklesIcon,
      color: "text-purple-500",
    },
  ];

  const renderTabContent = () => {
    // ----------------------------------------------------------------
    // 1. MY RIDES TAB
    // ----------------------------------------------------------------
    if (activeTab === "my_rides") {
      const myRawGroups = groups.filter(isGroupRelevant);

      if (myRawGroups.length === 0) {
        return (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
            <div className="bg-indigo-50 p-4 rounded-full mb-4">
              <MapIcon className="w-10 h-10 text-indigo-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              No active ride requests
            </h3>
            <p className="text-gray-500 mt-2 text-center max-w-sm">
              Start your journey by creating a ride request. We'll match you
              with others nearby.
            </p>
            <Link
              to="/request-ride"
              className="mt-6 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-colors"
            >
              Request a Ride
            </Link>
          </div>
        );
      }

      // Deduplication Logic
      const uniqueRides: Record<
        string,
        { primaryGroup: RideGroup; hasSuggestedMatch: boolean }
      > = {};

      myRawGroups.forEach((group) => {
        const rideId = getUserRideId(group);
        if (!rideId) return;

        if (!uniqueRides[rideId]) {
          uniqueRides[rideId] = {
            primaryGroup: group,
            hasSuggestedMatch: false,
          };
        }
        const entry = uniqueRides[rideId];

        if (group.group_type === "suggested") {
          if (group.member_count > 1) entry.hasSuggestedMatch = true;
          if (
            entry.primaryGroup.group_type === "suggested" &&
            group.member_count > entry.primaryGroup.member_count
          ) {
            entry.primaryGroup = group;
          }
        } else {
          // Corporate/Uni etc. takes priority over the generic 'suggested' view
          if (entry.primaryGroup.group_type === "suggested") {
            entry.primaryGroup = group;
          }
        }
      });

      const displayGroups = Object.values(uniqueRides);

      return (
        <div className="grid grid-cols-1 gap-6">
          {displayGroups.map(({ primaryGroup: group, hasSuggestedMatch }) => {
            const isMatched = group.member_count > 1;
            const statusColor = isMatched
              ? "bg-green-50 border-green-200"
              : "bg-white border-gray-100";

            return (
              <div
                key={group.group_id}
                className={`relative rounded-2xl p-6 shadow-sm border transition-all hover:shadow-md ${statusColor}`}
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4 flex items-center space-x-2">
                  {group.members[0]?.commute_time && (
                    <span className="flex items-center text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      <ClockIcon className="w-3 h-3 mr-1" />
                      {new Date(
                        group.members[0].commute_time,
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                  {isMatched ? (
                    <span className="flex items-center text-xs font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full uppercase tracking-wider">
                      Matched
                      <CheckCircleIcon className="w-4 h-4 ml-1 text-green-600" />
                    </span>
                  ) : (
                    <span className="flex items-center text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-wider border border-amber-100">
                      Pending
                      <span className="ml-2 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                    </span>
                  )}
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Left: Route Info */}
                  <div className="flex-1 pr-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <UserGroupIcon className="w-5 h-5 mr-2 text-indigo-500" />
                      My Request ({group.group_type})
                    </h3>

                    <div className="pl-2">
                      <RouteVisualizer
                        from={formatGrid(group.pickup_grid)}
                        to={formatGrid(group.dropoff_grid)}
                      />
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col items-center md:items-end space-y-3 min-w-[200px]">
                    {isMatched ? (
                      <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-green-100 shadow-sm w-full text-center md:text-right">
                        <div className="flex items-center justify-center md:justify-end text-sm font-medium text-green-800 mb-1">
                          <UserGroupIcon className="w-4 h-4 mr-1" />
                          {group.member_count} Riders Found
                        </div>
                        <p className="text-xs text-gray-500 mb-3">
                          Travel companions found nearby.
                        </p>
                        <Link
                          to={`/chat/${group.chat_room_id}`}
                          className="w-full inline-flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
                        >
                          <ChatAlt2Icon className="w-4 h-4 mr-2" />
                          Chat with Group
                        </Link>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 w-full text-center md:text-right">
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Looking for matches...
                        </p>
                        <p className="text-xs text-gray-400 italic">
                          No companions in this category yet.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Suggested Match Banner */}
                {!isMatched && hasSuggestedMatch && (
                  <div className="mt-5 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center">
                      <div className="p-2 bg-white rounded-lg shadow-sm mr-3">
                        <SparklesIcon className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          Good News!
                        </p>
                        <p className="text-xs text-gray-600">
                          We found a match for you in the{" "}
                          <span className="font-bold text-purple-700">
                            Suggested
                          </span>{" "}
                          category.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab("suggested")}
                      className="w-full sm:w-auto text-xs font-semibold bg-white border border-purple-200 text-purple-700 px-4 py-2 rounded-lg shadow-sm hover:bg-purple-50 hover:border-purple-300 transition-all flex items-center justify-center"
                    >
                      View Suggested Match
                      <ChevronRightIcon className="w-3 h-3 ml-1" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    // ----------------------------------------------------------------
    // 2. OTHER TABS (Corporate, Uni, etc.)
    // ----------------------------------------------------------------
    let filteredGroups = groups.filter((g) => g.group_type === activeTab);
    const isChatEnabled = activeTab === "suggested";

    const activeTabConfig = tabs.find((t) => t.id === activeTab);
    const ActiveIcon = activeTabConfig?.icon || UserGroupIcon;
    const activeColor = activeTabConfig?.color || "text-gray-400";

    if (filteredGroups.length === 0) {
      return (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
            <UserGroupIcon className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No Groups Found</h3>
          <p className="text-gray-500 max-w-sm mx-auto mt-2 text-sm">
            There are currently no active ride groups for{" "}
            <span className="font-semibold capitalize">
              {activeTab.replace("_", " ")}
            </span>
            . Check back later!
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredGroups.map((group) => (
          <div
            key={group.group_id}
            className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-indigo-100 transition-all duration-300 flex flex-col"
          >
            {/* Header with Type & Count */}
            <div className="p-5 flex justify-between items-start border-b border-gray-50 bg-gray-50/30">
              <div className="flex items-center space-x-2">
                <span
                  className={`p-1.5 rounded-lg bg-white shadow-sm ring-1 ring-gray-100`}
                >
                  {/* FIXED: Render as a Component, not a function call */}
                  <ActiveIcon className={`w-5 h-5 ${activeColor}`} />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 capitalize leading-tight">
                    {activeTab} Group
                  </h3>
                  <p className="text-xs text-gray-500">
                    #{group.group_id.substring(0, 6)}
                  </p>
                </div>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  group.member_count > 1
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {group.member_count} Riders
              </span>
            </div>

            {/* Content Body */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-start space-x-3 mb-4">
                  <LocationMarkerIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  {/* <div className="text-sm text-gray-700">
                    <span className="block font-medium text-gray-900">
                      {group.pickup_grid}
                    </span>
                    <span className="block text-gray-400 text-xs my-0.5 ml-0.5 border-l-2 border-gray-200 h-3"></span>
                    <span className="block font-medium text-gray-900">
                      {group.dropoff_grid}
                    </span>
                  </div> */}
                  <div className="text-sm text-gray-700">
                    <span className="block font-medium text-gray-900">
                      {formatGrid(group.pickup_grid)}
                    </span>
                    <span className="block text-gray-400 text-xs my-0.5 ml-0.5 border-l-2 border-gray-200 h-3"></span>
                    <span className="block font-medium text-gray-900">
                      {formatGrid(group.dropoff_grid)}
                    </span>
                  </div>
                </div>

                {/* Avatar Stack */}
                <div className="mb-4">
                  <p className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wide">
                    Members
                  </p>
                  <MemberStack members={group.members} />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-4 mt-auto border-t border-gray-100 flex justify-between items-center">
                <span className="text-xs text-gray-500 flex items-center bg-gray-50 px-2 py-1 rounded">
                  <ClockIcon className="h-3 w-3 mr-1" /> ±1hr Match
                </span>

                {group.chat_room_id && (
                  <>
                    {isChatEnabled ? (
                      <Link
                        to={`/chat/${group.chat_room_id}`}
                        className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                      >
                        Join Chat
                      </Link>
                    ) : (
                      <div
                        className="flex items-center text-gray-400 text-xs"
                        title="Join via 'My Requests' to chat"
                      >
                        <LockClosedIcon className="w-3 h-3 mr-1" />
                        <span className="font-medium">View Only</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading)
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Ride Matches
          </h1>
          <p className="mt-1 text-gray-500">
            Manage your active requests and discover ride-sharing groups.
          </p>
        </div>
        <button
          onClick={fetchGroups}
          className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-xl text-white bg-brand hover:bg-brand-700 shadow-lg shadow-brand-200 transition-all"
        >
          <RefreshIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Refresh
        </button>
        {/* <Link
          to="/ride"
          className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
        >
          <MapIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          New Request
        </Link> */}
      </div>

      {/* Modern Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
        <nav
          // CHANGED:
          // 1. Removed 'flex space-x-2 overflow-x-auto' base classes
          // 2. Added 'grid grid-cols-2 gap-2' for mobile (2 columns, no scroll)
          // 3. Added 'md:flex md:space-x-2 md:overflow-x-auto' to restore original look on desktop
          className="grid grid-cols-2 gap-2 md:flex md:space-x-2 md:overflow-x-auto pb-0"
          aria-label="Tabs"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const count =
              tab.id === "my_rides"
                ? Object.keys(
                    groups.filter(isGroupRelevant).reduce(
                      (acc, g) => {
                        const id = getUserRideId(g);
                        if (id) acc[id] = true;
                        return acc;
                      },
                      {} as Record<string, boolean>,
                    ),
                  ).length
                : groups.filter((g) => g.group_type === tab.id).length;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`
                  group relative flex items-center justify-center md:justify-start px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 w-full md:w-auto
                  ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200"
                      : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 border border-transparent"
                    // Added bg-gray-50 for mobile visibility on inactive states
                  }
                `}
              >
                <tab.icon
                  className={`
                    -ml-0.5 mr-2 h-5 w-5 flex-shrink-0 transition-colors
                    ${isActive ? tab.color : "text-gray-400 group-hover:text-gray-500"}
                  `}
                  aria-hidden="true"
                />
                <span className="truncate">{tab.label}</span>
                {count > 0 && (
                  <span
                    className={`
                      ml-2 py-0.5 px-2 rounded-full text-xs font-bold transition-colors
                      ${
                        isActive
                          ? "bg-white text-indigo-600 ring-1 ring-indigo-100"
                          : "bg-gray-200 text-gray-600 group-hover:bg-gray-300"
                      }
                    `}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content Area */}
      <div className="transition-opacity duration-300 ease-in-out">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default RideGroupsPage;
