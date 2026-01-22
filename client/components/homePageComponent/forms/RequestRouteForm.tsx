import React, { useState } from "react";
import { User, Phone, Mail, Clock, Send, AlertCircle } from "lucide-react";
import { AddressInput } from "../../AddressInput";

interface RequestRouteFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
  frequency?: string;
  pickup?: string;
  dropoff?: string;
}

export const RequestRouteForm: React.FC<RequestRouteFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    frequency: "",
    pickup: "",
    dropoff: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";

    const phoneRegex = /^\+?[\d\s\-()]{7,20}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Invalid phone format";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    if (!formData.frequency) newErrors.frequency = "Please select a frequency";
    if (!formData.pickup.trim())
      newErrors.pickup = "Pick-up address is required";
    if (!formData.dropoff.trim())
      newErrors.dropoff = "Drop-off address is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (isSubmitted) {
      // Re-validate field on change if user already tried to submit
      setTimeout(() => validate(), 0);
    }
  };

  const inputClasses = (field: keyof FormErrors) => `
    w-full px-5 py-4 border rounded-xl outline-none transition-all 
    ${
      errors[field]
        ? "border-rose-500 bg-rose-50 focus:ring-rose-200"
        : "border-stone-200 bg-stone-50 focus:border-brand focus:ring-2 focus:ring-brand/20 focus:bg-white"
    }
    text-stone-800
  `;

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl border border-stone-100 overflow-visible animate-fade-in-up">
      <div className="bg-brand px-8 py-10 text-center rounded-t-2xl">
        <h2 className="text-3xl md:text-4xl font-display font-medium text-white mb-2">
          Request/View Route
        </h2>
        <p className="text-brand-50 text-sm md:text-base font-light">
          Tell us your commute details and we'll help you find the perfect
          community match.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-8 md:p-12 space-y-6"
        noValidate
      >
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label
              className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ml-1 ${errors.name ? "text-rose-500" : "text-stone-500"}`}
            >
              <User className="w-3 h-3" /> Name
            </label>
            <input
              type="text"
              className={inputClasses("name")}
              placeholder="Your full name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
            {errors.name && (
              <p className="text-rose-500 text-xs ml-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.name}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label
              className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ml-1 ${errors.phone ? "text-rose-500" : "text-stone-500"}`}
            >
              <Phone className="w-3 h-3" /> Phone Number
            </label>
            <input
              type="tel"
              className={inputClasses("phone")}
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
            {errors.phone && (
              <p className="text-rose-500 text-xs ml-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.phone}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label
            className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ml-1 ${errors.email ? "text-rose-500" : "text-stone-500"}`}
          >
            <Mail className="w-3 h-3" /> Email Address
          </label>
          <input
            type="email"
            className={inputClasses("email")}
            placeholder="email@example.com"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
          {errors.email && (
            <p className="text-rose-500 text-xs ml-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.email}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ml-1 ${errors.frequency ? "text-rose-500" : "text-stone-500"}`}
          >
            <Clock className="w-3 h-3" /> Frequency of Commute
          </label>
          <select
            className={inputClasses("frequency")}
            value={formData.frequency}
            onChange={(e) => handleChange("frequency", e.target.value)}
          >
            <option value="" disabled>
              Select frequency
            </option>
            <option value="daily">Daily (Mon-Fri)</option>
            <option value="flexible">Flexible / Hybrid</option>
            <option value="occasional">Occasional</option>
            <option value="weekends">Weekends only</option>
          </select>
          {errors.frequency && (
            <p className="text-rose-500 text-xs ml-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.frequency}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <AddressInput
            label="Preferred Pick-up Address"
            placeholder="Where should we pick you up?"
            value={formData.pickup}
            onChange={(val) => handleChange("pickup", val)}
            error={errors.pickup}
          />
          <AddressInput
            label="Preferred Drop-off Address"
            placeholder="Where are you heading?"
            iconColor="text-rose-500"
            value={formData.dropoff}
            onChange={(val) => handleChange("dropoff", val)}
            error={errors.dropoff}
          />
        </div>

        <div className="flex flex-col-reverse md:flex-row justify-end gap-4 pt-8 border-t border-stone-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-4 text-stone-500 font-bold uppercase tracking-widest hover:text-brand hover:bg-stone-50 rounded-xl transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-10 py-4 bg-brand text-white font-bold uppercase tracking-widest rounded-xl hover:bg-brand-dark transition-all shadow-lg hover:shadow-brand/20 flex items-center justify-center gap-3 active:scale-95"
          >
            Submit Request <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
