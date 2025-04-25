import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading, user, token } = useAuth();

    console.log('ProtectedRoute - Auth Status:', {
        isAuthenticated,
        loading,
        hasUser: !!user,
        hasToken: !!token
    });

    if (loading) {
        console.log('ProtectedRoute - Loading...');
        return <div>Chargement...</div>;
    }

    if (!isAuthenticated) {
        console.log('ProtectedRoute - Not authenticated, redirecting to login');
        return <Navigate to="/login" replace />;
    }

    console.log('ProtectedRoute - Rendering protected content');
    return children;
};

export default ProtectedRoute; 