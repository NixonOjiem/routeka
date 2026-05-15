import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiService, RideGroup, User } from "../services/api";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { removeRideRequest } from "@/redux/slices/rideGroupsSlice";
import { AppDispatch } from "@/redux/store";
import { RootState } from "@/redux/store";
import { CategoryGrid } from "@/components/homePageComponent/CategoryGrid";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapIcon,
  UserGroupIcon,
  ChatAlt2Icon,
  ClockIcon,
  StarIcon,
  LockClosedIcon,
  LocationMarkerIcon,
  RefreshIcon,
  XIcon,
  LinkIcon,
} from "@heroicons/react/outline";
import { TrashIcon } from "@heroicons/react/outline";
import { CheckCircleIcon } from "@heroicons/react/solid";

type TabType = "my_rides" | "matched_rides" | "pending_rides" | "all_rides";

// --- Helper Components ---
interface RideGroupsPageProps {
  onRequestRoute: (id: string) => void;
}

const RouteVisualizer = ({ from, to }: { from: string; to: string }) => (
  <div className="flex flex-col space-y-1 relative pl-4 border-l-2 border-gray-200 ml-2 py-1">
    <div className="absolute -left-2.25 top-0 w-4 h-4 rounded-full bg-white border-4 border-indigo-500" />
    <div className="absolute -left-2.25 bottom-0 w-4 h-4 rounded-full bg-indigo-500" />
    <div className="text-sm text-gray-500 font-medium leading-none mb-4 -mt-1">
      {from}
    </div>
    <div className="text-sm text-gray-900 font-bold leading-none">{to}</div>
  </div>
);

const MemberStack = ({ members }: { members: any[] }) => (
  <div className="flex -space-x-2 overflow-hidden">
    {members.slice(0, 4).map((m, i) => (
      <div
        key={i}
        className="h-8 w-8 rounded-full ring-2 ring-white bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 uppercase"
        title={m.user_name}
      >
        {m.user_name?.charAt(0) || "?"}
      </div>
    ))}
    {members.length > 4 && (
      <div className="h-8 w-8 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-xs text-gray-500">
        +{members.length - 4}
      </div>
    )}
  </div>
);

// --- Main Component ---

export const UpdatedRideGroupsPage: React.FC<RideGroupsPageProps> = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [groups, setGroups] = useState<RideGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("my_rides");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // UPDATED: Accept isMatched to provide contextual prompts
  const handleDeleteRequest = async (requestId: number, isMatched: boolean) => {
    const confirmMessage = isMatched
      ? "Are you sure you want to cancel this request and leave your matched ride group?"
      : "Are you sure you want to cancel this pending ride request?";

    if (window.confirm(confirmMessage)) {
      try {
        await dispatch(removeRideRequest(requestId)).unwrap();
        toast.success("Ride request cancelled successfully");
        fetchGroups();
      } catch (error: any) {
        toast.error(error?.message || error || "Failed to cancel request");
      }
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getGroupedRides();
      setGroups(response.data.groups || []);
      if (response.data.user) setCurrentUser(response.data.user);
    } catch (error) {
      toast.error("Failed to load ride groups");
    } finally {
      setIsLoading(false);
    }
  };

  const formatGrid = (grid: any) => {
    if (grid?.name && grid.name !== "Unknown Area") return grid.name;
    if (typeof grid === "string") return grid;
    if (grid?.lat && grid?.lng) {
      return `${Number(grid.lat).toFixed(4)}, ${Number(grid.lng).toFixed(4)}`;
    }
    return "Unknown Location";
  };

  const isGroupRelevant = (group: RideGroup) => {
    if (!user || !currentUser) return false;
    return group.members.some((member) => member.user_id === currentUser.id);
  };

  const tabs = [
    {
      id: "matched_rides",
      label: "Matched Rides",
      icon: LinkIcon,
      color: "text-yellow-500",
    },
    {
      id: "pending_rides",
      label: "Pending Rides",
      icon: ClockIcon,
      color: "text-yellow-500",
    },
    {
      id: "all_rides",
      label: "All Rides",
      icon: UserGroupIcon,
      color: "text-indigo-500",
    },
    //popular routes tab
  ];

  const renderTabContent = () => {
    // ALL RIDES TAB – display every group
    if (activeTab === "all_rides") {
      if (groups.length === 0) {
        return (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
              <UserGroupIcon className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              No Groups Found
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto mt-2 text-sm">
              There are currently no active ride groups available.
            </p>
          </div>
        );
      }

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div
              key={group.group_id}
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-indigo-100 transition-all duration-300 flex flex-col"
            >
              <div className="p-5 flex justify-between items-start border-b border-gray-50 bg-gray-50/30">
                <div className="flex items-center space-x-2">
                  <span className="p-1.5 rounded-lg bg-white shadow-sm ring-1 ring-gray-100">
                    <UserGroupIcon className="w-5 h-5 text-indigo-500" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 capitalize leading-tight">
                      Ride Group
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

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start space-x-3 mb-4">
                    <LocationMarkerIcon className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
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
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wide">
                      Members
                    </p>
                    <MemberStack members={group.members} />
                  </div>
                </div>

                <div className="pt-4 mt-auto border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs text-gray-500 flex items-center bg-gray-50 px-2 py-1 rounded">
                    <ClockIcon className="h-3 w-3 mr-1" /> ±1hr Match
                  </span>
                  {group.chat_room_id && (
                    <>
                      {user ? (
                        <Link
                          to={`/chat/${group.chat_room_id}`}
                          className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                        >
                          Join Chat
                        </Link>
                      ) : (
                        <Link
                          to="/signin"
                          className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors flex items-center"
                        >
                          <LockClosedIcon className="w-3 h-3 mr-1" /> Sign in
                        </Link>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // --- User‑specific tabs (my_rides / matched_rides / pending_rides) ---
    let myRawGroups = groups.filter(isGroupRelevant);

    if (activeTab === "matched_rides") {
      myRawGroups = myRawGroups.filter((g) => g.member_count > 1);
    } else if (activeTab === "pending_rides") {
      myRawGroups = myRawGroups.filter((g) => g.member_count === 1);
    }

    if (!user || myRawGroups.length === 0) {
      let emptyTitle = "No active ride requests";
      let emptyMessage =
        "Start your journey by creating a ride request. We'll match you with others nearby.";

      if (activeTab === "matched_rides") {
        emptyTitle = "No matched rides yet";
        emptyMessage =
          "Once someone else requests a similar route, your ride will appear here.";
      } else if (activeTab === "pending_rides") {
        emptyTitle = "No pending rides";
        emptyMessage = "All your ride requests have been matched. Great!";
      } else if (!user) {
        emptyTitle = "Sign in to view your rides";
        emptyMessage =
          "You need to be logged in to see your personal ride matches.";
      }

      return (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
          <div className="bg-indigo-50 p-4 rounded-full mb-4">
            <MapIcon className="w-10 h-10 text-indigo-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">{emptyTitle}</h3>
          <p className="text-gray-500 mt-2 text-center max-w-sm">
            {emptyMessage}
          </p>
          {user && (
            <button
              onClick={() => navigate("/request")}
              className="mt-6 px-6 py-2.5 bg-brand hover:bg-teal-600 text-white font-medium rounded-lg shadow-sm transition-colors"
            >
              Request a Ride
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6">
        {myRawGroups.map((group) => {
          const isMatched = group.member_count > 1;
          const statusColor = isMatched
            ? "bg-green-50 border-green-200"
            : "bg-white border-gray-100";

          const userMemberObj = group.members.find(
            (m) => m.user_id === currentUser?.id,
          );

          // UPDATED: Prioritize ride_request_id if your API sends it in the member object, fallback to member id
          const requestId = userMemberObj?.ride_request_id || userMemberObj?.id;

          return (
            <div
              key={group.group_id}
              className={`relative rounded-2xl p-5 shadow-sm border transition-all hover:shadow-md ${statusColor}`}
            >
              {/* Header: Title + Actions Row */}
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <UserGroupIcon className="w-5 h-5 mr-2 text-brand" />
                  My Request
                </h3>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Delete Button */}
                  <button
                    onClick={() =>
                      requestId && handleDeleteRequest(requestId, isMatched)
                    }
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Cancel Request"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>

                  {/* Scheduled Time */}
                  {group.members[0]?.scheduled_time && (
                    <span className="flex items-center text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      <ClockIcon className="w-3 h-3 mr-1" />
                      {new Date(
                        group.members[0].scheduled_time,
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}

                  {/* Status Badge */}
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
              </div>

              {/* Main Content: Route + Match Info */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="flex-1">
                  <RouteVisualizer
                    from={formatGrid(group.pickup_grid)}
                    to={formatGrid(group.dropoff_grid)}
                  />
                </div>

                <div className="flex flex-col items-stretch md:items-end min-w-[200px]">
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
                        <ChatAlt2Icon className="w-4 h-4 mr-2" /> Chat with
                        Group
                      </Link>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 w-full text-center md:text-right">
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        Looking for matches...
                      </p>
                      <p className="text-xs text-gray-400 italic">
                        No companions found yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (isLoading)
    return (
      <div className="min-h-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );

  // Tab badge counts
  const myRelevant = groups.filter(isGroupRelevant);
  const matchedCount = myRelevant.filter((g) => g.member_count > 1).length;
  const pendingCount = myRelevant.filter((g) => g.member_count === 1).length;
  const myRidesCount = myRelevant.length;
  const allCount = groups.length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Category Modal */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCategoryModalOpen(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-6xl bg-stone-50 rounded-4xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-white">
                <div>
                  <h2 className="text-2xl font-bold text-stone-800">
                    Choose Ride Type
                  </h2>
                  <p className="text-stone-500 text-sm">
                    Select a category to start your journey
                  </p>
                </div>
                <button
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="p-2 hover:bg-stone-100 rounded-full transition-colors"
                >
                  <XIcon className="w-6 h-6 text-stone-500" />
                </button>
              </div>
              <div className="overflow-y-auto p-6 md:p-10">
                <CategoryGrid
                  onRequestRoute={(id) => {
                    setIsCategoryModalOpen(false);
                    navigate("/request", { state: { categoryId: id } });
                  }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
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
          className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-xl text-white bg-brand hover:bg-brand-100 hover:text-brand shadow-lg transition-all"
        >
          <RefreshIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />{" "}
          Refresh
        </button>
        <button
          onClick={() => navigate("/request")}
          className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-xl text-white bg-brand hover:bg-brand-100 hover:text-brand shadow-lg transition-all"
        >
          new request
        </button>
      </div>

      {/* Tab bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
        <nav
          className="grid grid-cols-2 gap-2 md:flex md:space-x-2 md:overflow-x-auto pb-0"
          aria-label="Tabs"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            let count = 0;
            if (tab.id === "my_rides") count = myRidesCount;
            else if (tab.id === "matched_rides") count = matchedCount;
            else if (tab.id === "pending_rides") count = pendingCount;
            else if (tab.id === "all_rides") count = allCount;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`group relative flex items-center justify-center md:justify-start px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 w-full md:w-auto ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 border border-transparent"
                }`}
              >
                <tab.icon
                  className={`-ml-0.5 mr-2 h-5 w-5 shrink-0 transition-colors ${
                    isActive
                      ? tab.color
                      : "text-gray-400 group-hover:text-gray-500"
                  }`}
                  aria-hidden="true"
                />
                <span className="truncate">{tab.label}</span>
                {count > 0 && (
                  <span
                    className={`ml-2 py-0.5 px-2 rounded-full text-xs font-bold transition-colors ${
                      isActive
                        ? "bg-white text-indigo-600 ring-1 ring-indigo-100"
                        : "bg-gray-200 text-gray-600 group-hover:bg-gray-300"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="transition-opacity duration-300 ease-in-out">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default UpdatedRideGroupsPage;
