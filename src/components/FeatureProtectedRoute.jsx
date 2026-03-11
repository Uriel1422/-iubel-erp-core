import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FeatureProtectedRoute = ({ children, featureId }) => {
    const { empresa, isLoading, hasAccess } = useAuth();

    if (isLoading) return null;

    if (!hasAccess(featureId)) {
        console.warn(`Acceso denegado a la función: ${featureId}. Empresa: ${empresa?.nombre}`);
        return <Navigate to="/" replace />;
    }

    return children;
};

export default FeatureProtectedRoute;
