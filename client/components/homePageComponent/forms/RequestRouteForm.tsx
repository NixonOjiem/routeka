import React, { useState, useEffect } from "react";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { User, Send, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { MapPicker } from "@/components/maps/MapPicker";
import { motion, AnimatePresence } from "framer-motion";

interface RequestRouteFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

interface FormData {
  name: string;
  phone: string;
  email: string;
  frequency: string;
  commute_time: string;
  pickup: { lat: number | null; lng: number | null };
  dropoff: { lat: number | null; lng: number | null };
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3 },
  },
} as const;

const stepVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: "easeInOut",
    },
  },
  exit: {
    opacity: 0,
    x: -50,
    transition: {
      duration: 0.3,
      ease: "easeIn",
    },
  },
} as const;

const progressBarVariants = {
  initial: { scaleX: 0 },
  animate: { scaleX: 1, transition: { duration: 0.8, ease: "easeInOut" } },
} as const;

const buttonVariants = {
  hover: {
    scale: 1.05,
    boxShadow:
      "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    transition: { duration: 0.2 },
  },
  tap: { scale: 0.98 },
  disabled: { opacity: 0.5, cursor: "not-allowed" },
} as const;

const inputFocusVariants = {
  focus: {
    scale: 1.02,
    boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.2)",
    transition: { duration: 0.2 },
  },
};

const successBadgeVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      type: "spring",
      stiffness: 200,
    },
  },
} as const;

const progressDotVariants = {
  inactive: {
    scale: 0.8,
    opacity: 0.5,
    transition: { duration: 0.3 },
  },
  active: {
    scale: 1.2,
    opacity: 1,
    transition: {
      duration: 0.3,
      type: "spring",
      stiffness: 300,
    },
  },
  completed: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.3 },
  },
} as const;

export const RequestRouteForm: React.FC<RequestRouteFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  // 1. Get Auth State from Redux
  const { user } = useSelector((state: RootState) => state.auth);

  // 2. Form State
  const [step, setStep] = useState(1);
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

  // --- AUTO-FILL LOGIC ---
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  // --- Helpers ---
  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    const newErrors: any = {};
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
      setErrors({ map: "Please select a pickup location" });
      return false;
    }
    setErrors({});
    return true;
  };

  const validateStep3 = () => {
    if (!formData.dropoff.lat) {
      setErrors({ map: "Please select a dropoff location" });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    setErrors({});
    setStep((prev) => prev - 1);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep3()) {
      const payload = {
        user_id: user?.id || null,
        name: user ? user.name : formData.name,
        email: user ? user.email : formData.email,
        phone: formData.phone,
        frequency: formData.frequency,
        commute_time: formData.commute_time,
        pickup_lat: formData.pickup.lat,
        pickup_lng: formData.pickup.lng,
        dropoff_lat: formData.dropoff.lat,
        dropoff_lng: formData.dropoff.lng,
      };
      onSubmit(payload);
    }
  };

  const inputClasses = (hasError: boolean) => `
    w-full px-5 py-4 border rounded-xl outline-none transition-all duration-200
    ${hasError ? "border-rose-500 bg-rose-50" : "border-stone-200 bg-stone-50 focus:border-brand focus:ring-2 focus:ring-brand/20 focus:bg-white"}
    text-stone-800
  `;

  const progress = (step / 3) * 100;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
      className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl border border-stone-100 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-brand px-8 py-8 text-center relative overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full bg-brand-dark"
          style={{ width: `${progress}%` }}
          variants={progressBarVariants}
          initial="initial"
          animate="animate"
          key={step}
        />

        <div className="relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-display font-medium text-white mb-2"
          >
            Request Route
          </motion.h2>

          <div className="flex justify-center gap-4 mt-8">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="flex flex-col items-center"
                variants={progressDotVariants}
                initial="inactive"
                animate={
                  step >= i ? (step === i ? "active" : "completed") : "inactive"
                }
              >
                <div className="relative">
                  <div
                    className={`h-4 w-4 rounded-full border-2 ${
                      step >= i ? "border-white bg-white" : "border-white/30"
                    }`}
                  />
                  {step > i && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <CheckCircle2 size={16} className="text-brand" />
                    </motion.div>
                  )}
                </div>
                <span
                  className={`text-xs mt-2 font-medium ${
                    step >= i ? "text-white" : "text-white/60"
                  }`}
                >
                  Step {i}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-8 md:p-12">
        <div className="h-120 flex flex-col pr-2">
          <AnimatePresence mode="wait">
            {/* STEP 1: Details */}
            {step === 1 && (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6 overflow-y-auto pr-2"
              >
                {user ? (
                  <motion.div
                    variants={successBadgeVariants}
                    initial="initial"
                    animate="animate"
                    className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-center gap-3"
                  >
                    <motion.div
                      className="bg-emerald-100 p-2 rounded-full text-emerald-600"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <CheckCircle2 size={20} />
                    </motion.div>
                    <div>
                      <p className="text-sm font-bold text-emerald-900">
                        Recognized as {user.name}
                      </p>
                      <p className="text-xs text-emerald-700">{user.email}</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ staggerChildren: 0.1 }}
                    className="space-y-6"
                  >
                    <div className="grid md:grid-cols-2 gap-6">
                      <motion.div
                        variants={{
                          hidden: { opacity: 0, x: -20 },
                          visible: { opacity: 1, x: 0 },
                        }}
                        className="space-y-2"
                      >
                        <label className="text-xs font-bold uppercase tracking-widest text-stone-500 ml-1">
                          Name
                        </label>
                        <motion.input
                          whileFocus="focus"
                          variants={inputFocusVariants}
                          type="text"
                          className={inputClasses(!!errors.name)}
                          value={formData.name}
                          onChange={(e) => updateField("name", e.target.value)}
                        />
                        {errors.name && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="text-rose-500 text-xs"
                          >
                            {errors.name}
                          </motion.p>
                        )}
                      </motion.div>
                      <motion.div
                        variants={{
                          hidden: { opacity: 0, x: 20 },
                          visible: { opacity: 1, x: 0 },
                        }}
                        className="space-y-2"
                      >
                        <label className="text-xs font-bold uppercase tracking-widest text-stone-500 ml-1">
                          Phone
                        </label>
                        <motion.input
                          whileFocus="focus"
                          variants={inputFocusVariants}
                          type="tel"
                          className={inputClasses(!!errors.phone)}
                          value={formData.phone}
                          onChange={(e) => updateField("phone", e.target.value)}
                        />
                        {errors.phone && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="text-rose-500 text-xs"
                          >
                            {errors.phone}
                          </motion.p>
                        )}
                      </motion.div>
                    </div>
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 },
                      }}
                      className="space-y-2"
                    >
                      <label className="text-xs font-bold uppercase tracking-widest text-stone-500 ml-1">
                        Email
                      </label>
                      <motion.input
                        whileFocus="focus"
                        variants={inputFocusVariants}
                        type="email"
                        className={inputClasses(!!errors.email)}
                        value={formData.email}
                        onChange={(e) => updateField("email", e.target.value)}
                      />
                      {errors.email && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="text-rose-500 text-xs"
                        >
                          {errors.email}
                        </motion.p>
                      )}
                    </motion.div>
                  </motion.div>
                )}

                {/* Shared Fields */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="grid md:grid-cols-2 gap-6 pt-2"
                >
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-stone-500 ml-1">
                      Frequency
                    </label>
                    <motion.select
                      whileFocus="focus"
                      variants={inputFocusVariants}
                      className={inputClasses(!!errors.frequency)}
                      value={formData.frequency}
                      onChange={(e) => updateField("frequency", e.target.value)}
                    >
                      <option value="">Select...</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="occasional">Occasional</option>
                    </motion.select>
                    {errors.frequency && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="text-rose-500 text-xs"
                      >
                        {errors.frequency}
                      </motion.p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-stone-500 ml-1">
                      Time of Commute
                    </label>
                    <motion.input
                      whileFocus="focus"
                      variants={inputFocusVariants}
                      type="datetime-local"
                      className={inputClasses(!!errors.commute_time)}
                      value={formData.commute_time}
                      onChange={(e) =>
                        updateField("commute_time", e.target.value)
                      }
                    />
                    {errors.commute_time && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="text-rose-500 text-xs"
                      >
                        {errors.commute_time}
                      </motion.p>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* STEP 2: Pickup Map */}
            {step === 2 && (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex-1 flex flex-col"
              >
                <MapPicker
                  label="Pickup Location"
                  onLocationSelect={(lat, lng) =>
                    updateField("pickup", { lat, lng })
                  }
                />
                {errors.map && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-rose-500 text-center mt-2 font-bold"
                  >
                    {errors.map}
                  </motion.p>
                )}
              </motion.div>
            )}

            {/* STEP 3: Dropoff Map */}
            {step === 3 && (
              <motion.div
                key="step3"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex-1 flex flex-col"
              >
                <MapPicker
                  label="Dropoff Location"
                  onLocationSelect={(lat, lng) =>
                    updateField("dropoff", { lat, lng })
                  }
                />
                {errors.map && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-rose-500 text-center mt-2 font-bold"
                  >
                    {errors.map}
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-between items-center pt-8 mt-auto border-t border-stone-100"
          >
            {step === 1 ? (
              <motion.button
                whileHover={{ x: -5 }}
                whileTap="tap"
                onClick={onCancel}
                className="text-stone-400 hover:text-stone-600 font-bold uppercase text-sm flex items-center gap-1"
              >
                <ArrowLeft size={16} /> Cancel
              </motion.button>
            ) : (
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={handleBack}
                className="flex items-center gap-2 text-stone-500 hover:text-brand font-bold uppercase text-sm"
              >
                <ArrowLeft size={16} /> Back
              </motion.button>
            )}

            {step < 3 ? (
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={handleNext}
                className="bg-brand hover:bg-brand-dark text-white px-8 py-3 rounded-xl font-bold uppercase flex items-center gap-2 shadow-lg transition-all"
              >
                Next Step <ArrowRight size={16} />
              </motion.button>
            ) : (
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={handleFinalSubmit}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold uppercase flex items-center gap-2 shadow-lg transition-all"
                // whileHover={{
                //   scale: 1.05,
                //   transition: {
                //     type: "spring",
                //     stiffness: 400,
                //     damping: 10,
                //   },
                // }}
                // whileTap={{ scale: 0.95 }}
              >
                <motion.span
                  animate={{
                    rotate: [0, 10, -10, 0],
                    transition: {
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 1,
                    },
                  }}
                >
                  <Send size={16} />
                </motion.span>
                Submit Request
              </motion.button>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
