import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ViewState, NotificationType } from "./types";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { NotificationToast } from "./components/redundant/NotificationToast";
import { Provider } from "react-redux";
import { store } from "./redux/store";

// Page Imports
import { HomePage } from "./pages/HomePage";
import { RequestPage } from "./pages/RequestPage";
import AuthenticationPage from "./pages/AuthenticationPage";
import TestPage from "./pages/TestPage";

// ✅ New pages
import RideGroupsPage from "@/pages/RideGroupsPage";
import ChatPage from "@/pages/ChatPage";

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

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
      {!isAuthPage && (
        <Header
          onViewChange={handleViewChange}
          currentView={getCurrentView()}
        />
      )}

      <main
        className={`flex-grow ${
          !isAuthPage ? "container mx-auto px-4 md:px-6 py-6 max-w-7xl" : ""
        }`}
      >
        {notification && (
          <NotificationToast
            type={notification.type}
            message={notification.message}
          />
        )}

        <Routes>
          {/* ✅ Keep existing routes */}
          <Route
            path="/"
            element={<HomePage onRequestRoute={() => navigate("/request")} />}
          />
          <Route
            path="/request"
            element={<RequestPage showNotification={showNotification} />}
          />
          <Route path="/test" element={<TestPage />} />
          <Route path="/signin" element={<AuthenticationPage />} />
          <Route path="/signup" element={<AuthenticationPage />} />
          <Route path="/auth" element={<Navigate to="/signin" replace />} />
          {/* <Route path="/auth" element={<AuthenticationPage />} /> */}

          {/* ✅ Add new routes */}
          <Route path="rides" element={<RideGroupsPage />} />
          <Route path="chat/:roomId" element={<ChatPage />} />
        </Routes>
      </main>

      {!isAuthPage && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}
