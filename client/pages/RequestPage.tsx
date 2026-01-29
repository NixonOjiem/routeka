import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RequestRouteForm } from "../components/homePageComponent/forms/RequestRouteForm";
import {
  submitRideRequest,
  clearRideRequestState,
} from "@/redux/slices/rideRequestSlice";
import { RootState } from "@/redux/store";
import type { AppDispatch } from "@/redux/store";
import { Loader2, Mail, CheckCircle, XCircle } from "lucide-react";
import { NotificationType } from "../types";

interface RequestPageProps {
  showNotification: (type: NotificationType, message: string) => void;
}

export const RequestPage: React.FC<RequestPageProps> = ({
  showNotification,
}) => {
  const navigate = useNavigate();
  //const dispatch = useDispatch();
  const dispatch = useDispatch<AppDispatch>();
  // Get Redux state
  const { user } = useSelector((state: RootState) => state.auth);
  const { loading, error, success } = useSelector(
    (state: RootState) => state.rideRequest,
  );

  const handleRouteRequestSubmit = async (data: any) => {
    // Dispatch the Redux action instead of calling storageService
    dispatch(submitRideRequest(data));
  };

  // Handle success/error states
  useEffect(() => {
    if (success) {
      showNotification(
        "success",
        `Request sent successfully! Our team has been notified of your route request.`,
      );

      // Navigate back to home after a short delay
      const timer = setTimeout(() => {
        navigate("/rides");
        // Reset the ride request state
        dispatch(clearRideRequestState());
      }, 2000);

      return () => clearTimeout(timer);
    }

    if (error) {
      showNotification(
        "error",
        `There was an issue sending your request: ${error}`,
      );
      // Clear error after showing notification
      dispatch(clearRideRequestState());
    }
  }, [success, error, navigate, dispatch, showNotification]);

  // Clear state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearRideRequestState());
    };
  }, [dispatch]);

  return (
    <div className="py-10 relative">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-10 rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-stone-100 flex flex-col items-center text-center gap-6 animate-fade-in-up max-w-sm w-full">
            <div className="relative">
              <div className="absolute inset-0 bg-brand/20 blur-xl rounded-full animate-pulse"></div>
              <div className="relative bg-brand text-white p-4 rounded-2xl">
                <Mail className="w-8 h-8" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-display font-bold text-stone-900">
                Submitting Request
              </h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                Sending your commute details to our server for processing...
              </p>
            </div>
            <Loader2 className="w-6 h-6 text-brand animate-spin" />
          </div>
        </div>
      )}

      {/* Success Overlay */}
      {success && (
        <div className="fixed inset-0 z-50 bg-emerald-900/20 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-10 rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-emerald-100 flex flex-col items-center text-center gap-6 animate-fade-in-up max-w-sm w-full">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-100 blur-xl rounded-full animate-pulse"></div>
              <div className="relative bg-emerald-500 text-white p-4 rounded-2xl">
                <CheckCircle className="w-8 h-8" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-display font-bold text-stone-900">
                Request Submitted!
              </h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                Your route request has been sent successfully. You'll be
                redirected to the rides page shortly.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {error && !loading && (
        <div className="fixed inset-0 z-50 bg-rose-900/20 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-10 rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-rose-100 flex flex-col items-center text-center gap-6 animate-fade-in-up max-w-sm w-full">
            <div className="relative">
              <div className="absolute inset-0 bg-rose-100 blur-xl rounded-full animate-pulse"></div>
              <div className="relative bg-rose-500 text-white p-4 rounded-2xl">
                <XCircle className="w-8 h-8" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-display font-bold text-stone-900">
                Submission Failed
              </h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                {error || "There was an issue submitting your request."}
              </p>
            </div>
            <button
              onClick={() => dispatch(clearRideRequestState())}
              className="px-6 py-2 bg-stone-100 hover:bg-stone-200 rounded-lg font-medium text-stone-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      <RequestRouteForm
        onSubmit={handleRouteRequestSubmit}
        onCancel={() => navigate("/")}
      />
    </div>
  );
};
