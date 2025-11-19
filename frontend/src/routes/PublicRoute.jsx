import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const PublicRoute = ({ children }) => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        );
    }

    if (user) return <Navigate to="/dashboard" replace />;

    return children;
};
export default PublicRoute;
