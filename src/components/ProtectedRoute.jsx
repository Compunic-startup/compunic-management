import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner'; // Import our new Spinner component

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, userRole, loading } = useAuth();

  // **THE KEY FIX IS HERE**
  // If the AuthContext is still loading the user's data,
  // display the spinner and wait.
  if (loading) {
    return <Spinner />;
  }

  // If loading is finished and there's no user, redirect to login.
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If loading is finished and the user's role is not allowed,
  // redirect to the unauthorized page.
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If everything is fine, render the requested component.
  return children;
};

export default ProtectedRoute;