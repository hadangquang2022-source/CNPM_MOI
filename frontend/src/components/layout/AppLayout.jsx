import React from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import { useAuth } from "../../contexts/AuthContext";

const AppLayout = ({ children }) => {
    const { user } = useAuth();
    const location = useLocation();

    // Auth pages that shouldn't show navbar
    const authPages = ['/login', '/register', '/forgot-password'];
    const isAuthPage = authPages.includes(location.pathname) || location.pathname.startsWith('/reset-password');

    // Show navbar for logged-in users or non-auth pages
    const showNavbar = user || !isAuthPage;

    return (
        <div className="min-h-screen bg-gray-50">
            {showNavbar && <Navbar />}
            <main className={showNavbar ? "pt-16" : ""}>{children}</main>
        </div>
    );
};

export default AppLayout;
