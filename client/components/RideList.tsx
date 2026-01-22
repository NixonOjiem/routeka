import React from 'react';
import { Ride } from '../types';
import { RideCard } from './RideCard';

interface RideListProps {
  rides: Ride[];
  onRequestSeat: (rideId: string) => void;
}

export const RideList: React.FC<RideListProps> = ({ rides, onRequestSeat }) => {
  if (rides.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300 animate-fade-in-up">
        <div className="text-slate-400 mb-2">No rides found matching your criteria.</div>
        <button className="text-brand font-medium hover:underline hover:text-brand-dark transition-colors active:text-brand-dark/80">Post a request instead?</button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {rides.map((ride, index) => (
        <RideCard 
          key={ride.id} 
          ride={ride} 
          onRequestSeat={onRequestSeat} 
          index={index}
        />
      ))}
    </div>
  );
};