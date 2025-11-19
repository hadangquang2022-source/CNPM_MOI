import React from "react";
import Navbar from "./Navbar";
import { useAuth } from "../../contexts/AuthContext";

const AppLayout = ({ children }) => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50">
            {user && <Navbar />}
            <main className={user ? "pt-16" : ""}>{children}</main>
        </div>
    );
};

export default AppLayout;
