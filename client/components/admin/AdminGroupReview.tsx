import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiService, UserGroup } from "@/services/api";
import { toast } from "react-toastify";

const AdminGroupReview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<(UserGroup & { creator?: any }) | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroup();
  }, [id]);

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

  const handleReview = async (status: "approved" | "rejected") => {
    if (!group) return;
    try {
      setProcessing(true);
      await apiService.reviewGroup(group.id, status);
      toast.success(`Group ${status} successfully!`);
      fetchGroup(); // refresh data to show updated status
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

        {group.status !== "pending" && (
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
