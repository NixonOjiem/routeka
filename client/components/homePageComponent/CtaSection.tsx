import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X as XIcon } from "lucide-react";
import { CategoryGrid } from "@/components/homePageComponent/CategoryGrid";

const buttonVariants = {
    hover: {
        scale: 1.05,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        transition: { type: "spring", stiffness: 400, damping: 10 },
    },
    tap: { scale: 0.95 },
} as const;

export default function CTASection() {
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <section className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 md:py-24">
            <div className="max-w-6xl mx-auto">
                <div className="relative bg-brand rounded-3xl shadow-2xl overflow-visible">
                    
                    {/* Mobile: car as faint background */}
                    <div className="absolute inset-0 z-0 flex items-center justify-center lg:hidden">
                        <img src="/images/Subaru-Taxi.png" alt="Car" className="object-contain opacity-20 w-120 h-90 sm:w-120 sm:h-120"/>
                    </div>

                    {/* Desktop: car */}
                    <div
                        className="absolute top-1/2 -right-32 transform -translate-y-1/2 z-10 hidden lg:block"
                        aria-hidden="true"
                    >
                        <img
                            src="/images/Subaru-Taxi.png"
                            alt="Car"
                            className="object-contain drop-shadow-2xl w-180 h-auto"
                        />
                    </div>

                    {/* Text content */}
                    <div className="relative z-20 p-8 sm:p-12 lg:p-16 lg:pr-140">
                        <div className="space-y-6 text-center lg:text-left">
                            <h3 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                                Ready to hit the road?
                            </h3>
                            <p className="text-lg text-white/90 max-w-2xl mx-auto lg:mx-0">
                                We stand as your trusted partner, guiding you through every turn of the road ahead.
                                Book your ride now and enjoy a seamless journey.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                {/* Button for popup for requesting a ride */}
                                <motion.button
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                    onClick={() => setIsCategoryModalOpen(true)}
                                    className="inline-flex items-center justify-center px-8 py-3 bg-white text-brand font-semibold rounded-full shadow-lg transition-colors hover:bg-stone-50"
                                >
                                    Book a Ride
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL INTEGRATION */}
            <AnimatePresence>
                {isCategoryModalOpen && (
                    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsCategoryModalOpen(false)}
                            className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-6xl bg-stone-50 rounded-4xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-white">
                                <div>
                                    <h2 className="text-2xl font-bold text-stone-800">Choose Ride Type</h2>
                                    <p className="text-stone-500 text-sm">Select a category to start your journey</p>
                                </div>
                                <button
                                    onClick={() => setIsCategoryModalOpen(false)}
                                    className="p-2 hover:bg-stone-100 rounded-full transition-colors"
                                >
                                    <XIcon className="w-6 h-6 text-stone-500" />
                                </button>
                            </div>
                            <div className="overflow-y-auto p-6 md:p-10">
                                <CategoryGrid
                                    onRequestRoute={(id) => {
                                        setIsCategoryModalOpen(false);
                                        navigate("/request", { state: { categoryId: id } });
                                    }}
                                />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
}