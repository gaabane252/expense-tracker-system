import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
    const { currentUser, userProfile } = useAuth();

    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    if (userProfile && !userProfile.isAdmin) {
        return <Navigate to="/" />;
    }

    // While loading user profile, we might want a spinner, 
    // but since AuthProvider ensures !loading before children, 
    // and fetchUserProfile is called in onAuthStateChanged, 
    // we should wait for userProfile if currentUser exists.
    if (!userProfile) {
        return <div className="loading-screen">Loading...</div>;
    }

    return children;
};

export default AdminRoute;
