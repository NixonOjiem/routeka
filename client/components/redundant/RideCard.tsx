import React, { useState } from "react";
import { Ride } from "../../types";
import { Clock, Users, Star, BadgeCheck, Check, Loader2 } from "lucide-react";

interface RideCardProps {
  ride: Ride;
  onRequestSeat: (rideId: string) => void;
  index?: number;
}

export const RideCard: React.FC<RideCardProps> = ({
  ride,
  onRequestSeat,
  index = 0,
}) => {
  const [requested, setRequested] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRequest = async () => {
    if (!requested && !isLoading) {
      setIsLoading(true);
      // Simulate a brief network interaction for better UX feel
      await new Promise((resolve) => setTimeout(resolve, 800));
      setRequested(true);
      setIsLoading(false);
      onRequestSeat(ride.id);
    }
  };

  return (
    <div
      className="group bg-white rounded-xl p-8 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.1)] border border-stone-100 transition-all duration-500 hover:-translate-y-2 flex flex-col h-full animate-fade-in-up opacity-0"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      {/* Header: Driver Info & Price */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="relative group-hover:scale-105 transition-transform duration-300">
            <img
              src={ride.driver.avatarUrl}
              alt={ride.driver.name}
              className="w-12 h-12 rounded-full object-cover border border-stone-200 shadow-sm"
            />
            {ride.driver.verified && (
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-stone-100">
                <BadgeCheck className="w-4 h-4 text-brand fill-brand-50" />
              </div>
            )}
          </div>
          <div>
            <h3 className="font-display font-semibold text-stone-900 text-lg leading-tight group-hover:text-brand transition-colors duration-300">
              {ride.driver.name}
            </h3>
            <div className="flex items-center text-xs font-medium text-stone-500 gap-2 mt-1">
              <span className="bg-stone-100 text-stone-600 px-2 py-0.5 rounded">
                {ride.driver.community}
              </span>
              <div className="flex items-center gap-0.5 text-amber-500">
                <Star className="w-3 h-3 fill-current" />
                <span>{ride.driver.rating}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-display text-2xl font-bold text-stone-900 group-hover:text-brand transition-colors duration-300">
            {ride.costPerSeat === 0 ? "Free" : `$${ride.costPerSeat}`}
          </div>
          <div className="text-xs text-stone-400 uppercase tracking-wider">
            per seat
          </div>
        </div>
      </div>

      {/* Route Visualization */}
      <div className="relative pl-4 border-l border-stone-200 space-y-6 mb-8 ml-2 flex-grow">
        {/* Origin */}
        <div className="relative group/point">
          <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full border-2 border-stone-300 bg-white group-hover:border-brand group-hover/point:scale-125 transition-all duration-300"></div>
          <div>
            <div className="text-xs text-stone-400 font-bold uppercase tracking-wider mb-1">
              Origin
            </div>
            <div className="text-sm font-medium text-stone-900">
              {ride.origin}
            </div>
          </div>
        </div>

        {/* Destination */}
        <div className="relative group/point">
          <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-stone-300 group-hover:bg-brand group-hover/point:scale-125 transition-all duration-300"></div>
          <div>
            <div className="text-xs text-stone-400 font-bold uppercase tracking-wider mb-1">
              Destination
            </div>
            <div className="text-sm font-medium text-stone-900">
              {ride.destination}
            </div>
          </div>
        </div>
      </div>

      {/* Time & Seats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8 border-t border-b border-stone-100 py-4">
        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4 text-stone-400 group-hover:text-brand transition-colors" />
          <div>
            <div className="text-xs text-stone-400 uppercase tracking-wider">
              Time
            </div>
            <div className="text-sm font-semibold text-stone-800">
              {ride.time}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 pl-4 border-l border-stone-100">
          <Users className="w-4 h-4 text-stone-400 group-hover:text-brand transition-colors" />
          <div>
            <div className="text-xs text-stone-400 uppercase tracking-wider">
              Seats
            </div>
            <div className="text-sm font-semibold text-stone-800">
              {ride.seatsAvailable} available
            </div>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {ride.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs px-3 py-1 bg-stone-50 text-stone-600 rounded-full border border-stone-200 group-hover:border-stone-300 group-hover:bg-white transition-colors"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Action Button */}
      <button
        onClick={handleRequest}
        disabled={requested || isLoading}
        className={`w-full py-3.5 rounded-lg text-sm font-bold transition-all duration-200 uppercase tracking-widest flex items-center justify-center gap-2 transform active:scale-95 ${
          requested
            ? "bg-stone-100 text-stone-400 cursor-default border border-stone-200"
            : "bg-white text-stone-900 border border-stone-200 hover:bg-brand hover:text-white hover:border-brand shadow-sm hover:shadow-lg hover:-translate-y-0.5"
        }`}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-brand" />
        ) : requested ? (
          <>
            <Check className="w-4 h-4" />
            Request Sent
          </>
        ) : (
          "Request Seat"
        )}
      </button>
    </div>
  );
};
