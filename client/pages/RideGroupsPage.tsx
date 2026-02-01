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
  ArrowNarrowRightIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/outline";

type TabType =
  | "my_rides"
  | "suggested"
  | "corporate"
  | "neighborhood"
  | "university"
  | "events";

// Helper to find the ride_id for the current user in a group
const getUserRideId = (
  group: RideGroup,
  currentUser: User | null,
  guestId: string | null,
) => {
  const member = group.members.find(
    (m) =>
      (currentUser && m.user_id === currentUser.id) ||
      (guestId && String(m.id) === String(guestId)),
  );
  return member ? member.id : null;
};

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

  const isGroupRelevant = (group: RideGroup) => {
    return group.members.some((member) => {
      if (currentUser && member.user_id === currentUser.id) return true;
      if (guestId && String(member.id) === String(guestId)) return true;
      return false;
    });
  };

  const tabs = [
    {
      id: "my_rides",
      label: "My Rides",
      icon: StarIcon,
      color: "text-yellow-600",
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
      id: "suggested",
      label: "Suggested",
      icon: SparklesIcon,
      color: "text-purple-600",
    },
  ];

  const renderTabContent = () => {
    if (activeTab === "my_rides") {
      const myRawGroups = groups.filter(isGroupRelevant);

      if (myRawGroups.length === 0) {
        return (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <h3 className="text-gray-900 font-medium">
              You have no active ride requests.
            </h3>
            <Link
              to="/request-ride"
              className="text-brand mt-2 inline-block font-bold"
            >
              Request a Ride
            </Link>
          </div>
        );
      }

      // --- DEDUPLICATION LOGIC ---
      const uniqueRides: Record<
        string,
        { primaryGroup: RideGroup; hasSuggestedMatch: boolean }
      > = {};

      myRawGroups.forEach((group) => {
        const rideId = getUserRideId(group, currentUser, guestId);
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
        <div className="space-y-6">
          {displayGroups.map(({ primaryGroup: group, hasSuggestedMatch }) => {
            const isMatched = group.member_count > 1;

            return (
              <div
                key={group.group_id}
                className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg text-gray-800">
                    My Ride Request{" "}
                    <span className="text-gray-400 font-normal text-sm">
                      ({group.group_type})
                    </span>
                  </h3>
                  {group.members[0]?.scheduled_time && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full flex items-center">
                      <ClockIcon className="w-3 h-3 mr-1" />
                      {new Date(
                        group.members[0].scheduled_time,
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  {/* Left: Request Info */}
                  <div className="flex-1 bg-gray-50 p-4 rounded-lg border border-gray-200 w-full">
                    <div className="flex items-center text-sm font-bold text-gray-700 mb-2">
                      <UserGroupIcon className="h-5 w-5 mr-2 text-brand" />
                      Me ({currentUser?.name || "Guest"})
                    </div>
                    <div className="text-xs text-gray-500">
                      <p>Pickup Grid: {group.pickup_grid}</p>
                      <p>Dropoff Grid: {group.dropoff_grid}</p>
                    </div>
                  </div>

                  {/* Center: Arrow Icon */}
                  <div className="flex flex-col items-center justify-center text-center px-4">
                    {isMatched ? (
                      <>
                        <div className="bg-green-100 p-2 rounded-full mb-2">
                          <ArrowNarrowRightIcon className="h-6 w-6 text-green-600 transform rotate-90 md:rotate-0" />
                        </div>
                        <span className="text-xs font-bold text-green-700 uppercase tracking-wide">
                          Matched
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="bg-gray-100 p-2 rounded-full mb-2">
                          <ExclamationCircleIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                          Pending
                        </span>
                      </>
                    )}
                  </div>

                  {/* Right: Result Area */}
                  <div
                    className={`flex-1 p-4 rounded-lg border w-full ${isMatched ? "bg-blue-50 border-blue-200" : "bg-red-50 border-red-200"}`}
                  >
                    {isMatched ? (
                      <div>
                        <div className="flex items-center text-sm font-bold text-blue-800 mb-2">
                          <ChatAlt2Icon className="h-5 w-5 mr-2" />
                          Matched Group ({group.member_count} Riders)
                        </div>
                        <p className="text-xs text-blue-600 mb-3">
                          Travel companions found on route.
                        </p>
                        <Link
                          to={`/chat/${group.chat_room_id}`}
                          className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded shadow-sm hover:bg-blue-700"
                        >
                          Open Chat
                        </Link>
                      </div>
                    ) : (
                      <div className="text-center md:text-left">
                        <p className="text-sm font-bold text-red-600 mb-1">
                          Unmatched in {group.group_type}
                        </p>
                        <p className="text-sm text-gray-700 italic">
                          "No users in this category yet."
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Suggested Match Banner */}
                {!isMatched && hasSuggestedMatch && (
                  <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <SparklesIcon className="h-5 w-5 text-purple-600 mr-2" />
                      <div>
                        <p className="text-sm font-bold text-purple-900">
                          Good News!
                        </p>
                        <p className="text-xs text-purple-700">
                          We found a match for you in the{" "}
                          <span className="font-bold">Suggested</span> category.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab("suggested")}
                      className="text-xs bg-purple-600 text-white px-3 py-2 rounded shadow-sm hover:bg-purple-700 whitespace-nowrap ml-3"
                    >
                      View Suggested
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    // --- Standard Card View for Other Tabs ---
    let filteredGroups = groups.filter((g) => g.group_type === activeTab);

    if (filteredGroups.length === 0) {
      return (
        <div className="text-center py-10 bg-white rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500">
            No active groups found for {activeTab}.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredGroups.map((group) => (
          <div
            key={group.group_id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border-l-4 border-l-brand"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 capitalize">
                    {activeTab} Group
                  </h3>
                  <div className="flex items-center mt-1 text-sm text-gray-500">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    Grid: {group.pickup_grid} → {group.dropoff_grid}
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded-md text-xs font-bold ${group.member_count > 1 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                >
                  {group.member_count} Riders
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {group.members.slice(0, 4).map((m, i) => (
                  <span
                    key={i}
                    className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs border border-slate-200"
                  >
                    {m.user_name}
                  </span>
                ))}
              </div>
              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm text-gray-500 flex items-center">
                  <MapIcon className="h-4 w-4 mr-1" /> Match within 1hr
                </span>
                {group.chat_room_id && (
                  <Link
                    to={`/chat/${group.chat_room_id}`}
                    className="text-brand hover:underline text-sm font-medium"
                  >
                    View Chat
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading)
    return <div className="p-10 text-center">Loading rides...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900">Ride Matches</h1>
        </div>
        <div className="overflow-x-auto">
          <nav className="flex space-x-2 px-4">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const count =
                tab.id === "my_rides"
                  ? Object.keys(
                      groups.filter(isGroupRelevant).reduce(
                        (acc, g) => {
                          const id = getUserRideId(g, currentUser, guestId);
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
                  className={`${isActive ? "border-brand text-brand bg-blue-50/50" : "border-transparent text-gray-500 hover:text-gray-700"} whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm flex items-center transition-colors`}
                >
                  <tab.icon
                    className={`w-5 h-5 mr-2 ${isActive ? tab.color : "text-gray-400"}`}
                  />
                  {tab.label}
                  <span
                    className={`ml-2 py-0.5 px-2 rounded-full text-xs ${isActive ? "bg-white shadow-sm text-gray-800" : "bg-gray-100 text-gray-600"}`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
      {renderTabContent()}
    </div>
  );
};

export default RideGroupsPage;
