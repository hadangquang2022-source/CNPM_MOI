import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RoleBasedRedirect = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Admin goes to dashboard
    if (user.role?.name === 'Admin') {
        return <Navigate to="/dashboard" replace />;
    }

    // Everyone else goes to home (customer interface)
    return <Navigate to="/home" replace />;
};

export default RoleBasedRedirect;
