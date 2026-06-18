import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { RideProvider } from './contexts/RideContext';
import { BookingProvider } from './contexts/BookingContext';
import { ChatProvider } from './contexts/ChatContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import HomePage from './pages/home/HomePage';
import SearchRidesPage from './pages/ride/SearchRidesPage';
import CreateRidePage from './pages/ride/CreateRidePage';
import RideDetailPage from './pages/ride/RideDetailPage';
import BookingsPage from './pages/booking/BookingsPage';
import MyRidesPage from './pages/booking/MyRidesPage';
import ChatsPage from './pages/chat/ChatsPage';
import ProfilePage from './pages/profile/ProfilePage';
import AdminPage from './pages/admin/AdminPage';
import ResalesPage from './pages/resale/ResalesPage';
import ResaleDetailPage from './pages/resale/ResaleDetailPage';
import CreateResalePage from './pages/resale/CreateResalePage';
import EditResalePage from './pages/resale/EditResalePage';
import MyResalesPage from './pages/resale/MyResalesPage';
import OtpPage from './pages/auth/OtpPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import NotificationsPage from './pages/NotificationPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import LandingPage from './pages/LandingPage';
import InstallPrompt from './components/InstallPrompt';
import UpdatePrompt from './components/UpdatePrompt';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RideProvider>
          <BookingProvider>
            <ChatProvider>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password/:resetToken" element={<ResetPasswordPage />} />
                  <Route path="/privacy" element={<PrivacyPolicyPage />} />
                  <Route path="/*" element={
                    <ProtectedRoute>
                      <Layout>
                        <Routes>
                          <Route path="/home" element={<HomePage />} />
                          <Route path="/search" element={<SearchRidesPage />} />
                          <Route path="/create-ride" element={<CreateRidePage />} />
                          <Route path="/rides/:id" element={<RideDetailPage />} />
                          <Route path="/bookings" element={<BookingsPage />} />
                          <Route path="/my-rides" element={<MyRidesPage />} />
                          <Route path="/resales" element={<ResalesPage />} />
                          <Route path="/resales/new" element={<CreateResalePage />} />
                          <Route path="/resales/edit/:id" element={<EditResalePage />} />
                          <Route path="/resales/:id" element={<ResaleDetailPage />} />
                          <Route path="/my-resales" element={<MyResalesPage />} />
                          <Route path="/verify-phone" element={<OtpPage />} />
                          <Route path="/notifications" element={<NotificationsPage />} />
                          <Route path="/chats" element={<ChatsPage />} />
                          <Route path="/chats/:chatId" element={<ChatsPage />} />
                          <Route path="/profile" element={<ProfilePage />} />
                          <Route path="/admin" element={<AdminPage />} />
                          <Route path="/" element={<Navigate to="/home" />} />
                          <Route path="*" element={<Navigate to="/home" />} />
                        </Routes>
                      </Layout>
                    </ProtectedRoute>
                  } />
                </Routes>
              <InstallPrompt />
              <UpdatePrompt />
              </ChatProvider>
          </BookingProvider>
        </RideProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
