import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const PublicRoute = ({ children, redirectIfAuthenticated = true }) => {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        );
    }

    // If user is logged in and on auth pages (login, register, etc.), redirect to dashboard
    const authPages = ['/login', '/register', '/forgot-password'];
    const isAuthPage = authPages.includes(location.pathname) || location.pathname.startsWith('/reset-password');
    
    if (user && isAuthPage && redirectIfAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};
export default PublicRoute;
