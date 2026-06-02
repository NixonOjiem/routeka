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

  const isGroupCreator = currentUser?.id === group?.creator_id;
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
      fetchGroup();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Action failed");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Page Header Layout */}
      <header className="mb-8 pb-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {group.name}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">ID: {group.id}</p>
        </div>
        <div>
          <span
            className={`inline-flex px-3 py-1 rounded text-xs font-semibold tracking-wide uppercase ${
              group.status === "approved"
                ? "bg-green-50 text-green-700 border border-green-200"
                : group.status === "pending"
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {group.status}
          </span>
        </div>
      </header>

      {/* Main Content Grid Split */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Left Hand Details Column */}
        <aside className="md:col-span-1 space-y-6 md:pr-4 md:border-r md:border-gray-100 min-h-full">
          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Description
            </h2>
            <p className="text-sm text-gray-700 leading-normal">
              {group.description || "No description provided."}
            </p>
          </div>

          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Creator
            </h2>
            <div className="text-sm">
              <p className="font-medium text-gray-900">
                {group.creator?.name || "Unknown"}
              </p>
              <p className="text-gray-500 text-xs">{group.creator?.email}</p>
            </div>
          </div>

          {/* Action Module for Review Status */}
          {group.status === "pending" && (
            <div className="pt-4 border-t border-gray-100">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Review Request
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => handleReview("approved")}
                  disabled={processing}
                  className="flex-1 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReview("rejected")}
                  disabled={processing}
                  className="flex-1 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>
          )}

          {group.status !== "pending" && group.status !== "approved" && (
            <div className="pt-2">
              <p className="text-xs text-gray-400 italic">
                This request context is finalized.
              </p>
            </div>
          )}
        </aside>

        {/* Right Hand Functional Management Area */}
        {group.status === "approved" && canManage && (
          <main className="md:col-span-2 space-y-8">
            {/* User List Panel */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Current Members
              </h2>
              {members.length === 0 ? (
                <p className="text-sm text-gray-500 italic">
                  No members assigned to this group.
                </p>
              ) : (
                <div className="border border-gray-100 rounded-lg divide-y divide-gray-100 overflow-hidden">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="p-3.5 flex items-center justify-between hover:bg-gray-50/50 transition-colors group"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {member.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {member.email} <span className="mx-1.5">•</span>
                          <span className="capitalize font-medium text-indigo-600">
                            {member.role}
                          </span>
                        </p>
                      </div>
                      {member.id !== group.creator_id && (
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-xs font-medium text-red-600 md:opacity-0 group-hover:opacity-100 transition-opacity hover:underline focus:opacity-100"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Invite/Search Module Panel */}
            <section className="bg-gray-50/60 p-5 rounded-xl border border-gray-100">
              <h2 className="text-base font-bold text-gray-900">Add Members</h2>
              <p className="text-xs text-gray-500 mb-4">
                Query network profiles by email addresses.
              </p>

              <div className="relative max-w-sm">
                <input
                  type="text"
                  placeholder="Search by email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() =>
                    searchResults.length > 0 && setIsSearchOpen(true)
                  }
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded shadow-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />

                {isSearchOpen && searchResults.length > 0 && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-auto">
                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        className="px-3 py-2 hover:bg-indigo-50 cursor-pointer flex justify-between items-center border-b border-gray-50 last:border-0"
                      >
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-medium text-gray-900 truncate">
                            {user.name}
                          </span>
                          <span className="text-[11px] text-gray-500 truncate">
                            {user.email}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-indigo-600 whitespace-nowrap ml-2">
                          Select
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Selection Staging Badges */}
              {selectedUsers.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200/60">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Staged Additions
                  </h3>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {selectedUsers.map((user) => (
                      <span
                        key={user.id}
                        className="inline-flex items-center bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded text-xs font-medium border border-indigo-100"
                      >
                        {user.name}
                        <button
                          onClick={() => handleRemoveSelectedUser(user.id)}
                          className="ml-1.5 text-indigo-400 hover:text-indigo-700 transition-colors focus:outline-none"
                          aria-label="Deselect user"
                        >
                          <svg
                            className="h-3 w-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={handleAddMembers}
                    disabled={processing}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {processing ? "Saving..." : "Commit Members"}
                  </button>
                </div>
              )}
            </section>
          </main>
        )}
      </div>
    </div>
  );
};

export default AdminGroupReview;
