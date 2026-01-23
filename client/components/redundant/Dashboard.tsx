import React from "react";
import { RouteRequest } from "../../types";
import {
  Clock,
  MapPin,
  User,
  Mail,
  Phone,
  Calendar,
  Search,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface DashboardProps {
  requests: RouteRequest[];
}

export const Dashboard: React.FC<DashboardProps> = ({ requests }) => {
  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-medium text-stone-900">
            Your Activity
          </h1>
          <p className="text-stone-500 mt-1">
            Manage your route requests and monitor backend matches.
          </p>
        </div>
        <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium border border-emerald-100 flex items-center gap-2 w-fit">
          <ShieldCheck className="w-4 h-4" />
          Backend Sync Active
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-stone-200 p-20 text-center">
          <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-stone-300" />
          </div>
          <h3 className="text-xl font-display font-semibold text-stone-800">
            No requests found
          </h3>
          <p className="text-stone-500 max-w-xs mx-auto mt-2">
            Submit a route request to see it appear in this dashboard.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
            >
              <div className="p-6 md:p-8 flex flex-col lg:flex-row gap-8">
                {/* Left: Status & Main Info */}
                <div className="lg:w-1/3 space-y-4">
                  <div className="flex items-center justify-between lg:justify-start lg:gap-4">
                    <span
                      className={`
                      px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest
                      ${req.status === "pending" ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"}
                    `}
                    >
                      {req.status === "pending" ? "Finding Matches" : "Matched"}
                    </span>
                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-stone-900">
                      <User className="w-4 h-4 text-brand" />
                      <span className="font-semibold">{req.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-stone-500 text-sm">
                      <Mail className="w-4 h-4" />
                      <span>{req.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-stone-500 text-sm">
                      <Phone className="w-4 h-4" />
                      <span>{req.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Center: The Route */}
                <div className="lg:w-1/2 bg-stone-50/50 rounded-xl p-5 border border-stone-100 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex flex-col items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-brand" />
                      <div className="w-0.5 h-6 bg-stone-200" />
                      <div className="w-2 h-2 rounded-full border-2 border-brand bg-white" />
                    </div>
                    <div className="space-y-4 flex-grow">
                      <div>
                        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                          From
                        </div>
                        <div className="text-sm font-medium text-stone-800">
                          {req.pickup}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                          To
                        </div>
                        <div className="text-sm font-medium text-stone-800">
                          {req.dropoff}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Actions / Meta */}
                <div className="lg:w-1/6 flex flex-row lg:flex-col justify-between lg:justify-center items-center gap-4">
                  <div className="text-center">
                    <Clock className="w-5 h-5 text-stone-300 mx-auto mb-1" />
                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                      Frequency
                    </div>
                    <div className="text-sm font-semibold text-brand capitalize">
                      {req.frequency}
                    </div>
                  </div>
                  <button className="p-3 bg-stone-100 hover:bg-brand hover:text-white text-stone-500 rounded-full transition-all group-hover:scale-110">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
