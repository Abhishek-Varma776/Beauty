import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Footer } from "./components/layout/Footer";
import { Navbar } from "./components/layout/Navbar";
import { AdminRoute } from "./components/routes/AdminRoute";
import { ProtectedRoute } from "./components/routes/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AuthPage } from "./pages/AuthPage";
import { BookingPage } from "./pages/BookingPage";
import { BookingSuccessPage } from "./pages/BookingSuccessPage";
import { CustomerDashboardPage } from "./pages/CustomerDashboardPage";
import { LandingPage } from "./pages/LandingPage";
import { NotFoundPage } from "./pages/NotFoundPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/auth/:mode" element={<AuthPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <CustomerDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/book/:serviceId"
                element={
                  <ProtectedRoute>
                    <BookingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/booking/success/:bookingId"
                element={
                  <ProtectedRoute>
                    <BookingSuccessPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboardPage />
                  </AdminRoute>
                }
              />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
