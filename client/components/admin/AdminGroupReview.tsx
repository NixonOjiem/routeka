import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiService, UserGroup, GroupMember, SearchUser } from "@/services/api";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const AdminGroupReview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<
    (UserGroup & { creator?: any; members?: GroupMember[] }) | null
  >(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<SearchUser[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  console.log("currentUser?.roles:", currentUser?.roles);
  console.log("group status:", group?.status);

  const isGroupCreator = currentUser?.id === group?.creator_id;
  console.log(
    "current user id:" +
      currentUser?.id +
      " group creator id:" +
      group?.creator_id,
  );

  const isGroupAdmin = members.some(
    (m) => m.email === currentUser?.email && m.role === "group-admin",
  );
  const isSuperAdmin = currentUser?.roles?.some((r) => {
    if (typeof r === "string") return r === "super-admin";
    if (typeof r === "object" && r !== null) return r.name === "super-admin";
    return false;
  });

  const canManage = isSuperAdmin || isGroupAdmin || isGroupCreator;
  useEffect(() => {
    fetchGroup();
  }, [id]);

  useEffect(() => {
    if (group?.status === "approved") {
      fetchMembers();
    }
  }, [group]);

  const fetchGroup = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminGroup(Number(id));
      setGroup(response.data.group);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to load group");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await apiService.getGroupMembers(Number(id));
      setMembers(response.data.members);
    } catch (error: any) {
      toast.error("Failed to load members");
    }
  };

  // Debounced search
  const debounce = (fn: Function, ms = 300) => {
    let timer: NodeJS.Timeout;
    return (...args: any) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  };

  const performSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setSearchResults([]);
        setIsSearchOpen(false);
        return;
      }
      try {
        const res = await apiService.searchUsers(query);
        setSearchResults(res.data.users);
        setIsSearchOpen(true);
      } catch (error) {
        toast.error("Search failed");
      }
    }, 300),
    [],
  );

  useEffect(() => {
    performSearch(searchQuery);
  }, [searchQuery]);

  const handleSelectUser = (user: SearchUser) => {
    if (!selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    setSearchQuery("");
    setIsSearchOpen(false);
  };

  const handleRemoveSelectedUser = (userId: number) => {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== userId));
  };

  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) return;
    try {
      setProcessing(true);
      const userIds = selectedUsers.map((u) => u.id);
      await apiService.addGroupMembers(Number(id), userIds);
      toast.success("Members added successfully");
      setSelectedUsers([]);
      fetchMembers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add members");
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (memberId === group?.creator_id) {
      toast.error("Cannot remove the group creator.");
      return;
    }
    if (!window.confirm("Remove this member?")) return;
    try {
      await apiService.removeGroupMember(Number(id), memberId);
      toast.success("Member removed");
      fetchMembers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to remove member");
    }
  };

  const handleReview = async (status: "approved" | "rejected") => {
    if (!group) return;
    try {
      setProcessing(true);
      await apiService.reviewGroup(group.id, status);
      toast.success(`Group ${status} successfully!`);
      fetchGroup(); // refresh data
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Action failed");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Group not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="bg-white rounded-2xl shadow p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
          <p className="text-sm text-gray-500">Group ID: {group.id}</p>
        </div>

        <div className="border-t pt-4">
          <h2 className="text-sm font-medium text-gray-500">Description</h2>
          <p className="mt-1 text-gray-800">
            {group.description || "No description provided."}
          </p>
        </div>

        <div className="border-t pt-4">
          <h2 className="text-sm font-medium text-gray-500">Creator</h2>
          <p className="mt-1 text-gray-800">
            {group.creator?.name || "Unknown"} ({group.creator?.email})
          </p>
        </div>

        <div className="border-t pt-4">
          <h2 className="text-sm font-medium text-gray-500">Status</h2>
          <span
            className={`mt-1 inline-block px-3 py-1 rounded-full text-sm font-semibold ${
              group.status === "approved"
                ? "bg-green-100 text-green-700"
                : group.status === "pending"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-red-100 text-red-700"
            }`}
          >
            {group.status}
          </span>
        </div>

        {/* Member management section (only for approved groups and authorized users) */}
        {group.status === "approved" && canManage && (
          <div className="border-t pt-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Members</h2>

            {/* Current members list */}
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between bg-gray-50 p-2 rounded-lg"
                >
                  <div>
                    <span className="font-medium">{member.name}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      ({member.email}) –{" "}
                      <span className="capitalize">{member.role}</span>
                    </span>
                  </div>
                  {member.id !== group.creator_id && (
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add member search & select */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-700">Add Members</h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() =>
                    searchResults.length > 0 && setIsSearchOpen(true)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                {isSearchOpen && searchResults.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        className="px-4 py-2 hover:bg-indigo-50 cursor-pointer flex justify-between"
                      >
                        <span>
                          {user.name}{" "}
                          <span className="text-gray-500">({user.email})</span>
                        </span>
                        <span className="text-xs text-indigo-600">Add</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected users tags */}
              {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedUsers.map((user) => (
                    <span
                      key={user.id}
                      className="inline-flex items-center bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm"
                    >
                      {user.name}
                      <button
                        onClick={() => handleRemoveSelectedUser(user.id)}
                        className="ml-2 text-indigo-600 hover:text-indigo-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <button
                onClick={handleAddMembers}
                disabled={selectedUsers.length === 0 || processing}
                className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {processing ? "Adding..." : "Add Members"}
              </button>
            </div>
          </div>
        )}

        {/* Approval / rejection buttons */}
        {group.status === "pending" && (
          <div className="border-t pt-6 flex gap-4">
            <button
              onClick={() => handleReview("approved")}
              disabled={processing}
              className="w-full md:w-auto px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Approve
            </button>
            <button
              onClick={() => handleReview("rejected")}
              disabled={processing}
              className="w-full md:w-auto px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              Reject
            </button>
          </div>
        )}

        {group.status !== "pending" && group.status !== "approved" && (
          <div className="border-t pt-4">
            <p className="text-sm text-gray-500">
              This group request has already been processed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminGroupReview;
