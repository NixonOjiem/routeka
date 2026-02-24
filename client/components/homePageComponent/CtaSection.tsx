import React from 'react';

export default function CTASection() {
  return (
    <section className="bg-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-sky-400 rounded-lg shadow-xl overflow-visible max-w-5xl mx-auto">
          {/* Mobile: image as subtle background */}
          <div className="absolute inset-0 z-0 flex justify-center items-center lg:hidden">
            <img
              src="/images/subaru_PNG119245.png"
              alt="Car"
              className="object-contain opacity-20 w-65 h-48.75 sm:w-90 sm:h-67.5"
            />
          </div>

          {/* Desktop: image poking outside the card */}
          <div
            className="pointer-events-none absolute top-1/2 right-0 -translate-y-1/2 z-10 hidden lg:block lg:translate-x-1/2"
            aria-hidden="true"
          >
            <img
              src="/images/subaru_PNG119245.png"
              alt="Car"
              className="object-contain drop-shadow-xl lg:w-160 lg:h-120"
            />
          </div>

          {/* Text content */}
          <div className="relative z-10 p-8 sm:p-12 lg:p-16">
            <div className="space-y-6 text-center lg:text-left">
              <h3 className="text-3xl font-extrabold text-white sm:text-4xl">
                Ready to get started?
              </h3>
              <p className="text-lg text-white">
                We stand as your trusted partner, guiding you through every turn of the road ahead.
              </p>
              <div>
                <a
                  href="#"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-sky-600 bg-white hover:bg-gray-100"
                >
                  Contact Us
                  <svg
                    className="ml-2 -mr-1 w-5 h-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}