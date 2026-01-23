import React, { useState } from "react";
import { useSelector } from "react-redux"; // Import Redux hook
import {
  User,
  Phone,
  Mail,
  Clock,
  Send,
  AlertCircle,
  MapPin,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { MapPicker } from "@/components/maps/MapPicker"; // Import the map component created above

// --- Types ---
interface RootState {
  auth: {
    user: any | null; // Replace 'any' with your actual User type
    token: string | null;
  };
}

interface RequestRouteFormProps {
  onSubmit: (data: any) => void; // This will call your API
  onCancel: () => void;
}

interface FormData {
  name: string;
  phone: string;
  email: string;
  frequency: string;
  commute_time: string; // Added this field
  pickup: { lat: number | null; lng: number | null };
  dropoff: { lat: number | null; lng: number | null };
}

// --- Main Component ---
export const RequestRouteForm: React.FC<RequestRouteFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  // 1. Get Auth State from Redux
  const { user } = useSelector((state: RootState) => state.auth);

  // 2. Form State
  const [step, setStep] = useState(1); // 1: Details, 2: Pickup, 3: Dropoff
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    frequency: "",
    commute_time: "",
    pickup: { lat: null, lng: null },
    dropoff: { lat: null, lng: null },
  });

  const [errors, setErrors] = useState<any>({});

  // --- Helpers ---
  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // --- Validation Logic ---
  const validateStep1 = () => {
    const newErrors: any = {};

    // Only validate personal info if USER IS NOT LOGGED IN
    if (!user) {
      if (!formData.name.trim()) newErrors.name = "Name is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    }

    if (!formData.frequency) newErrors.frequency = "Frequency is required";
    if (!formData.commute_time) newErrors.commute_time = "Time is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    if (!formData.pickup.lat) {
      setErrors({ map: "Please select a pickup location on the map" });
      return false;
    }
    setErrors({});
    return true;
  };

  const validateStep3 = () => {
    if (!formData.dropoff.lat) {
      setErrors({ map: "Please select a dropoff location on the map" });
      return false;
    }
    setErrors({});
    return true;
  };

  // --- Navigation Handlers ---
  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    if (step === 2 && validateStep2()) setStep(3);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep3()) {
      // Construct Payload for Laravel
      const payload = {
        // If user is logged in, these will be ignored by backend logic or handled via token
        guest_name: !user ? formData.name : undefined,
        guest_email: !user ? formData.email : undefined,
        guest_phone: !user ? formData.phone : undefined,

        frequency: formData.frequency,
        commute_time: formData.commute_time,

        // Coordinates
        pickup: formData.pickup,
        dropoff: formData.dropoff,
      };

      onSubmit(payload);
    }
  };

  // --- CSS Helper ---
  const inputClasses = (hasError: boolean) => `
    w-full px-5 py-4 border rounded-xl outline-none transition-all 
    ${hasError ? "border-rose-500 bg-rose-50" : "border-stone-200 bg-stone-50 focus:border-brand focus:ring-2 focus:ring-brand/20 focus:bg-white"}
    text-stone-800
  `;

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl border border-stone-100 overflow-hidden animate-fade-in-up">
      {/* Header */}
      <div className="bg-brand px-8 py-8 text-center">
        <h2 className="text-3xl font-display font-medium text-white mb-2">
          Request Route
        </h2>
        <div className="flex justify-center gap-2 mt-4">
          {/* Step Indicators */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-2 w-12 rounded-full transition-all ${step >= i ? "bg-white" : "bg-white/30"}`}
            />
          ))}
        </div>
      </div>

      <div className="p-8 md:p-12">
        {/* --- STEP 1: Details --- */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            {/* Conditional Rendering based on Auth */}
            {!user ? (
              <>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-stone-500 ml-1">
                      Name
                    </label>
                    <input
                      type="text"
                      className={inputClasses(!!errors.name)}
                      value={formData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                    />
                    {errors.name && (
                      <p className="text-rose-500 text-xs">{errors.name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-stone-500 ml-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      className={inputClasses(!!errors.phone)}
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                    />
                    {errors.phone && (
                      <p className="text-rose-500 text-xs">{errors.phone}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-stone-500 ml-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className={inputClasses(!!errors.email)}
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                  />
                  {errors.email && (
                    <p className="text-rose-500 text-xs">{errors.email}</p>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-blue-900">
                    Logged in as {user.name}
                  </p>
                  <p className="text-xs text-blue-700">
                    We'll use your account details for this request.
                  </p>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-stone-500 ml-1">
                  Frequency
                </label>
                <select
                  className={inputClasses(!!errors.frequency)}
                  value={formData.frequency}
                  onChange={(e) => updateField("frequency", e.target.value)}
                >
                  <option value="">Select...</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="occasional">Occasional</option>
                </select>
                {errors.frequency && (
                  <p className="text-rose-500 text-xs">{errors.frequency}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-stone-500 ml-1">
                  Time of Commute
                </label>
                <input
                  type="datetime-local"
                  className={inputClasses(!!errors.commute_time)}
                  value={formData.commute_time}
                  onChange={(e) => updateField("commute_time", e.target.value)}
                />
                {errors.commute_time && (
                  <p className="text-rose-500 text-xs">{errors.commute_time}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- STEP 2: Pickup Map --- */}
        {step === 2 && (
          <div className="animate-fade-in space-y-4">
            <MapPicker
              label="Step 2: Where should we pick you up?"
              onLocationSelect={(lat, lng) =>
                updateField("pickup", { lat, lng })
              }
            />
            {errors.map && (
              <p className="text-rose-500 text-center font-bold">
                {errors.map}
              </p>
            )}
            {formData.pickup.lat && (
              <p className="text-center text-green-600 font-bold text-sm bg-green-50 p-2 rounded">
                Pickup Selected: {formData.pickup.lat.toFixed(4)},{" "}
                {formData.pickup.lng.toFixed(4)}
              </p>
            )}
          </div>
        )}

        {/* --- STEP 3: Dropoff Map --- */}
        {step === 3 && (
          <div className="animate-fade-in space-y-4">
            <MapPicker
              label="Step 3: Where are you going?"
              onLocationSelect={(lat, lng) =>
                updateField("dropoff", { lat, lng })
              }
            />
            {errors.map && (
              <p className="text-rose-500 text-center font-bold">
                {errors.map}
              </p>
            )}
            {formData.dropoff.lat && (
              <p className="text-center text-green-600 font-bold text-sm bg-green-50 p-2 rounded">
                Dropoff Selected: {formData.dropoff.lat.toFixed(4)},{" "}
                {formData.dropoff.lng.toFixed(4)}
              </p>
            )}
          </div>
        )}

        {/* --- Footer / Buttons --- */}
        <div className="flex justify-between items-center pt-8 mt-6 border-t border-stone-100">
          {step === 1 ? (
            <button
              onClick={onCancel}
              className="text-stone-400 hover:text-stone-600 font-bold uppercase text-sm"
            >
              Cancel
            </button>
          ) : (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-stone-500 hover:text-brand font-bold uppercase text-sm"
            >
              <ArrowLeft size={16} /> Back
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={handleNext}
              className="bg-brand hover:bg-brand-dark text-white px-8 py-3 rounded-xl font-bold uppercase flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              Next Step <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleFinalSubmit}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold uppercase flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              Submit Request <Send size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
