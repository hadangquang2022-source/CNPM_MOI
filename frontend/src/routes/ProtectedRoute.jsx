import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children, requiredRole = null }) => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;

    // Role Validation
    const userRole = user.role?.name;

    if (requiredRole === "Admin" && userRole !== "Admin") {
        return <Navigate to="/home" replace />;
    }

    if (requiredRole === "Manager" && !["Manager", "Admin"].includes(userRole)) {
        return <Navigate to="/home" replace />;
    }

    return children;
};

export default ProtectedRoute;
