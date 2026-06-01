import React, { useState, useEffect } from "react";
import { ProtectedRoute } from "./components/authPages/ProtectedRoute";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  Navigate,
  useLocation,
} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ViewState, NotificationType } from "./types";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { NotificationToast } from "./components/redundant/NotificationToast";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "./redux/store";
import { fetchUserProfile } from "./redux/slices/authSlice";

// Page Imports
import { HomePage } from "./pages/HomePage";
import { RequestPage } from "./pages/RequestPage";
import AuthenticationPage from "./pages/AuthenticationPage";
import TestPage from "./pages/TestPage";
import ProfilePage from "./pages/ProfilePage";
import RideGroupsPage from "@/pages/RideGroupsPage";
import ChatPage from "@/pages/ChatPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPPasswordPage from "@/pages/ResetPPasswordPage";
import { UpdatedRideGroupsPage } from "./pages/UpdatedRideGroupsPage";
import AdminGroupReview from "./components/admin/AdminGroupReview";
import { apiService } from "./services/api";
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  //Fetch user profile (with roles) if the user is logged in but roles are missing
  useEffect(() => {
    console.log("running useeffect now for profile");
    if (currentUser && (!currentUser.roles || currentUser.roles.length === 0)) {
      console.log("rinning apiservice to get profile");
      apiService
        .getUserProfile()
        .then((res) => console.log("Profile API response:", res))
        .catch((err) => console.error("Profile API error:", err));
    }
  }, [currentUser]);

  const isAuthPage =
    /^\/(auth|signin|signup|chat|forgot-password|reset-password)/.test(
      location.pathname,
    );

  const isHomePage = location.pathname === "/"; // ← new condition for full‑width hero

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
        className={`grow${
          !isAuthPage && !isHomePage
            ? "container mx-auto px-4 md:px-6 py-6 max-w-7xl"
            : ""
        } ${isHomePage ? "w-full" : ""}`}
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
            element={
              <HomePage
                onRequestRoute={(id) =>
                  navigate("/request", { state: { categoryId: id } })
                }
              />
            }
          />

          <Route path="/test" element={<TestPage />} />
          <Route path="/signin" element={<AuthenticationPage />} />
          <Route path="/signup" element={<AuthenticationPage />} />
          <Route path="/auth" element={<Navigate to="/signin" replace />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPPasswordPage />} />
          <Route path="/login" element={<Navigate to="/signin" replace />} />

          {/* ✅ Add new routes */}
          {/* <Route path="rides" element={<RideGroupsPage />} /> */}
          <Route path="rides" element={<UpdatedRideGroupsPage />} />
          <Route path="chat/:roomId" element={<ChatPage />} />

          {/* protected routes */}
          <Route path="/admin/groups/:id" element={<AdminGroupReview />} />
          {/* <Route
            path="/admin/groups/:id"
            element={
              <ProtectedRoute>
                <AdminGroupReview />
              </ProtectedRoute>
            }
          /> */}
          <Route
            path="/request"
            element={
              <ProtectedRoute>
                <RequestPage showNotification={showNotification} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage showNotification={showNotification} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      {!isAuthPage && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <Router>
          <AppContent />
        </Router>
      </Provider>
    </GoogleOAuthProvider>
  );
}
