import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { ViewState, NotificationType } from "./types";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { NotificationToast } from "./components/NotificationToast";

// Page Imports
import { HomePage } from "./pages/HomePage";
import { RequestPage } from "./pages/RequestPage";
import TestPage from "./pages/TestPage";
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  // Determines 'currentView' for the Header based on URL
  const getCurrentView = (): ViewState => {
    return location.pathname === "/request" ? "request" : "home";
  };

  const [notification, setNotification] = useState<{
    type: NotificationType;
    message: string;
  } | null>(null);

  const showNotification = (type: NotificationType, message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Helper to handle Header navigation if it still uses the old prop pattern
  const handleViewChange = (view: ViewState) => {
    if (view === "request") navigate("/request");
    else navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-brand-100 selection:text-brand-dark">
      {/* Pass navigation handler to Header */}
      <Header onViewChange={handleViewChange} currentView={getCurrentView()} />

      <main className="flex-grow container mx-auto px-4 md:px-6 py-6 max-w-7xl">
        {notification && (
          <NotificationToast
            type={notification.type}
            message={notification.message}
          />
        )}

        <Routes>
          <Route
            path="/"
            element={<HomePage onRequestRoute={() => navigate("/request")} />}
          />
          <Route
            path="/request"
            element={<RequestPage showNotification={showNotification} />}
          />
          <Route path="/test" element={<TestPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
