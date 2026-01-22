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
import AuthenticationPage from "./pages/AuthenticationPage";
import TestPage from "./pages/TestPage";

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Check if the current route is the auth page
  const isAuthPage = location.pathname === "/auth";

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

  const handleViewChange = (view: ViewState) => {
    if (view === "request") navigate("/request");
    else navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-brand-100 selection:text-brand-dark">
      {/* 2. Conditionally render Header */}
      {!isAuthPage && (
        <Header
          onViewChange={handleViewChange}
          currentView={getCurrentView()}
        />
      )}

      <main
        className={`flex-grow ${!isAuthPage ? "container mx-auto px-4 md:px-6 py-6 max-w-7xl" : ""}`}
      >
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
          <Route path="/auth" element={<AuthenticationPage />} />
        </Routes>
      </main>

      {/* 3. Conditionally render Footer */}
      {!isAuthPage && <Footer />}
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
