import React, { useState } from "react";
import { ViewState, NotificationType } from "./types";
import { Header } from "./components/Header";
import { RequestRouteForm } from "./components/RequestRouteForm";
import { storageService } from "./services/storage";
import { Loader2, Mail } from "lucide-react";

// New Component Imports
import { HeroSection } from "./components/homePageComponent/HeroSection";
import { CategoryGrid } from "./components/homePageComponent/CategoryGrid";
import { ValueProposition } from "./components/homePageComponent/ValueProposition";
import { Footer } from "./components/Footer";
import { NotificationToast } from "./components/NotificationToast";

export default function App() {
  const [view, setView] = useState<ViewState>("home");
  const [notification, setNotification] = useState<{
    type: NotificationType;
    message: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRouteRequestSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Process data and dispatch simulated email via storage service
      await storageService.saveRouteRequest(data);

      showNotification(
        "success",
        `Request sent! team@routeka.com has been notified of your route.`,
      );
      setView("home");
    } catch (error) {
      showNotification(
        "error",
        "There was an issue sending your request. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const showNotification = (type: NotificationType, message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const renderContent = () => {
    switch (view) {
      case "request":
        return (
          <div className="py-10 relative">
            {isSubmitting && (
              <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white p-10 rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-stone-100 flex flex-col items-center text-center gap-6 animate-fade-in-up max-w-sm w-full">
                  <div className="relative">
                    <div className="absolute inset-0 bg-brand/20 blur-xl rounded-full animate-pulse"></div>
                    <div className="relative bg-brand text-white p-4 rounded-2xl">
                      <Mail className="w-8 h-8" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-display font-bold text-stone-900">
                      Dispatching Request
                    </h3>
                    <p className="text-stone-500 text-sm leading-relaxed">
                      Sending your commute details to{" "}
                      <span className="font-semibold text-brand">
                        team@routeka.com
                      </span>{" "}
                      for community matching...
                    </p>
                  </div>
                  <Loader2 className="w-6 h-6 text-brand animate-spin" />
                </div>
              </div>
            )}
            <RequestRouteForm
              onSubmit={handleRouteRequestSubmit}
              onCancel={() => setView("home")}
            />
          </div>
        );
      case "home":
      default:
        return (
          <div className="space-y-12 md:space-y-24">
            <HeroSection />
            <CategoryGrid onRequestRoute={() => setView("request")} />
            <ValueProposition />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-brand-100 selection:text-brand-dark">
      <Header onViewChange={setView} currentView={view} />

      <main className="flex-grow container mx-auto px-4 md:px-6 py-6 max-w-7xl">
        {notification && (
          <NotificationToast
            type={notification.type}
            message={notification.message}
          />
        )}

        {renderContent()}
      </main>

      <Footer />
    </div>
  );
}
