import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RequestRouteForm } from "../components/homePageComponent/forms/RequestRouteForm";
import { storageService } from "../services/storage";
import { Loader2, Mail } from "lucide-react";
import { NotificationType } from "../types";

interface RequestPageProps {
  showNotification: (type: NotificationType, message: string) => void;
}

export const RequestPage: React.FC<RequestPageProps> = ({
  showNotification,
}) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRouteRequestSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await storageService.saveRouteRequest(data);
      showNotification(
        "success",
        `Request sent! team@routeka.com has been notified of your route.`,
      );
      // Navigate back to home on success
      navigate("/");
    } catch (error) {
      showNotification(
        "error",
        "There was an issue sending your request. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-10 relative">
      {/* Loading Overlay */}
      {isSubmitting && (
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
                Dispatching Request
              </h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                Sending your commute details to{" "}
                <span className="font-semibold text-brand">
                  team@routeka.com
                </span>{" "}
                for community matching...
              </p>
            </div>
            <Loader2 className="w-6 h-6 text-brand animate-spin" />
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
