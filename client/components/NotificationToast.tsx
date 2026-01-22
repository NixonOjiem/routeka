import React from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { NotificationType } from "../types";

interface NotificationToastProps {
  type: NotificationType;
  message: string;
}

export const NotificationToast = ({
  type,
  message,
}: NotificationToastProps) => {
  return (
    <div
      className={`fixed bottom-6 right-6 p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-right z-50 ${
        type === "success"
          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
          : "bg-rose-50 text-rose-800 border border-rose-200"
      }`}
    >
      {type === "success" ? (
        <CheckCircle2 className="w-5 h-5" />
      ) : (
        <AlertCircle className="w-5 h-5" />
      )}
      <span className="font-medium">{message}</span>
    </div>
  );
};
