import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./contexts/AuthContext";
import AppLayout from "./components/layout/AppLayout";

// Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import UserList from "./pages/users/UserList";
import UserCreate from "./pages/users/UserCreate";
import UserEdit from "./pages/users/UserEdit";
import PublicRoute from "./routes/PublicRoute";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
    return (
        <AuthProvider>
            <Router
                future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true
                }}
            >
                <AppLayout>
                    <Routes>
                        {/* Public Routes */}
                        <Route
                            path="/login"
                            element={
                                <PublicRoute>
                                    <Login />
                                </PublicRoute>
                            }
                        />

                        <Route
                            path="/register"
                            element={
                                <PublicRoute>
                                    <Register />
                                </PublicRoute>
                            }
                        />

                        <Route
                            path="/forgot-password"
                            element={
                                <PublicRoute>
                                    <ForgotPassword />
                                </PublicRoute>
                            }
                        />

                        <Route
                            path="/reset-password/:token"
                            element={
                                <PublicRoute>
                                    <ResetPassword />
                                </PublicRoute>
                            }
                        />

                        {/* Protected Routes */}
                        <Route
                            path="/dashboard"
                            element={
                                <PublicRoute>
                                    <Dashboard />
                                </PublicRoute>
                            }
                        />

                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            }
                        />

                        {/* Manager / Admin Routes */}
                        <Route
                            path="/users"
                            element={
                                <ProtectedRoute requiredRole="Manager">
                                    <UserList />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/users/create"
                            element={
                                <ProtectedRoute requiredRole="Admin">
                                    <UserCreate />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/users/edit/:id"
                            element={
                                <ProtectedRoute requiredRole="Admin">
                                    <UserEdit />
                                </ProtectedRoute>
                            }
                        />

                        {/* Default */}
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>

                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: "#363636",
                                color: "#fff"
                            }
                        }}
                    />
                </AppLayout>
            </Router>
        </AuthProvider>
    );
}

export default App;
