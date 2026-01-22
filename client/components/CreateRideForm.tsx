import React, { useState } from 'react';
import { Ride, CommunityGroup } from '../types';
import { AlertCircle, Calendar, Clock, Users, DollarSign, Tag, FileText } from 'lucide-react';
import { AddressInput } from './AddressInput';

interface CreateRideFormProps {
  onSubmit: (ride: Ride) => void;
  onCancel: () => void;
}

interface FormErrors {
  origin?: string;
  destination?: string;
  date?: string;
  time?: string;
  seats?: string;
  cost?: string;
  description?: string;
}

export const CreateRideForm: React.FC<CreateRideFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    seats: 3,
    cost: 0,
    description: '',
    tags: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.origin.trim()) newErrors.origin = 'Origin is required';
    if (!formData.destination.trim()) newErrors.destination = 'Destination is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.time) newErrors.time = 'Time is required';
    if (formData.seats < 1 || formData.seats > 6) newErrors.seats = 'Seats must be between 1 and 6';
    if (formData.cost < 0) newErrors.cost = 'Cost cannot be negative';
    if (!formData.description.trim()) newErrors.description = 'Description is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    if (validate()) {
      const newRide: Ride = {
        id: Math.random().toString(36).substr(2, 9),
        driver: {
          id: 'me',
          name: 'Alex M.',
          avatarUrl: 'https://picsum.photos/100/100?grayscale',
          rating: 5.0,
          community: CommunityGroup.NEIGHBORHOOD,
          verified: true
        },
        origin: formData.origin,
        destination: formData.destination,
        date: formData.date,
        time: formData.time,
        seatsAvailable: formData.seats,
        costPerSeat: formData.cost,
        description: formData.description,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
      };
      onSubmit(newRide);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (isSubmitted) setTimeout(() => validate(), 0);
  };

  const inputClasses = (field: keyof FormErrors) => `
    w-full px-4 py-3 border rounded-lg outline-none transition-all 
    ${errors[field] 
      ? 'border-rose-500 bg-rose-50 focus:ring-rose-200' 
      : 'border-stone-200 bg-stone-50 focus:ring-1 focus:ring-brand focus:border-brand focus:bg-white'}
    text-stone-800 font-light
  `;

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-xl shadow-stone-200/50 border border-stone-100 overflow-visible animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-brand px-8 py-8 rounded-t-xl">
        <h2 className="text-3xl font-display font-medium text-white">Offer a Ride</h2>
        <p className="text-brand-50 text-sm mt-1 font-light">Share your journey and strengthen your community.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8 space-y-8" noValidate>
        <div className="grid md:grid-cols-2 gap-8">
          <AddressInput 
            label="Origin"
            placeholder="Starting point"
            value={formData.origin}
            onChange={val => handleChange('origin', val)}
            error={errors.origin}
            className="!space-y-2"
          />
          <AddressInput 
            label="Destination"
            placeholder="Where are you going?"
            value={formData.destination}
            onChange={val => handleChange('destination', val)}
            error={errors.destination}
            className="!space-y-2"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${errors.date ? 'text-rose-500' : 'text-stone-500'}`}>
              <Calendar className="w-3 h-3" /> Date
            </label>
            <input 
              type="date" 
              className={inputClasses('date')}
              value={formData.date}
              onChange={e => handleChange('date', e.target.value)}
            />
            {errors.date && <p className="text-rose-500 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.date}</p>}
          </div>
          <div className="space-y-2">
            <label className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${errors.time ? 'text-rose-500' : 'text-stone-500'}`}>
              <Clock className="w-3 h-3" /> Time
            </label>
            <input 
              type="time" 
              className={inputClasses('time')}
              value={formData.time}
              onChange={e => handleChange('time', e.target.value)}
            />
            {errors.time && <p className="text-rose-500 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.time}</p>}
          </div>
           <div className="space-y-2">
            <label className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${errors.seats ? 'text-rose-500' : 'text-stone-500'}`}>
              <Users className="w-3 h-3" /> Seats
            </label>
            <input 
              type="number" 
              min="1"
              max="6"
              className={inputClasses('seats')}
              value={formData.seats}
              onChange={e => handleChange('seats', parseInt(e.target.value) || 0)}
            />
            {errors.seats && <p className="text-rose-500 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.seats}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <label className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${errors.cost ? 'text-rose-500' : 'text-stone-500'}`}>
            <DollarSign className="w-3 h-3" /> Cost per Seat ($)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-stone-400 font-serif">$</span>
            <input 
              type="number" 
              min="0"
              className={`${inputClasses('cost')} pl-8`}
              placeholder="0 for free"
              value={formData.cost}
              onChange={e => handleChange('cost', parseInt(e.target.value) || 0)}
            />
          </div>
          {errors.cost && <p className="text-rose-500 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.cost}</p>}
          <p className="text-xs text-stone-400 font-medium">Enter 0 to offer a free ride.</p>
        </div>

        <div className="space-y-2">
          <label className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${errors.description ? 'text-rose-500' : 'text-stone-500'}`}>
            <FileText className="w-3 h-3" /> Description
          </label>
          <textarea 
            rows={3}
            className={inputClasses('description')}
            placeholder="Any specific details about the ride? (e.g. meeting point, music preferences)"
            value={formData.description}
            onChange={e => handleChange('description', e.target.value)}
          ></textarea>
          {errors.description && <p className="text-rose-500 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.description}</p>}
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-wider">
            <Tag className="w-3 h-3" /> Tags
          </label>
          <input 
            type="text" 
            className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:ring-1 focus:ring-brand focus:border-brand outline-none transition-all bg-stone-50 focus:bg-white font-light text-stone-800"
            placeholder="Quiet, Pets Allowed, Big Trunk... (comma separated)"
            value={formData.tags}
            onChange={e => handleChange('tags', e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-4 pt-8 border-t border-stone-100">
          <button 
            type="button"
            onClick={onCancel}
            className="px-8 py-3 text-stone-500 font-medium hover:text-brand hover:bg-stone-50 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="px-8 py-3 bg-brand text-white font-medium rounded-lg hover:bg-brand-dark transition-all"
          >
            Publish Ride
          </button>
        </div>
      </form>
    </div>
  );
};