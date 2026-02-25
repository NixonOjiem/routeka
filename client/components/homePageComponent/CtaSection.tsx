import React from 'react';

export default function CTASection() {
    return (
        <section className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 md:py-24">
            <div className="max-w-6xl mx-auto">
                <div className="relative bg-brand rounded-3xl shadow-2xl overflow-visible">
                    {/* Mobile: car as faint background */}
                    <div className="absolute inset-0 z-0 flex items-center justify-center lg:hidden">
                        <img src="/images/Subaru-Taxi.png" alt="Car" className="object-contain opacity-20 w-120 h-90 sm:w-120 sm:h-120"/>
                    </div>

                    {/* Desktop: car – now 42rem wide */}
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

                    {/* Text content – right padding increased to avoid overlap */}
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
                                <a
                                    href="#"
                                    className="inline-flex items-center justify-center px-6 py-3 bg-white text-brand font-semibold rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                                >
                                    Book a Ride
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}