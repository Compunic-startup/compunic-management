import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner'; // Import our new Spinner component

function DashboardRedirect() {
  const { userRole, loading } = useAuth(); // Get the loading state
  const navigate = useNavigate();

  useEffect(() => {
    // This effect will now only run when loading is false and userRole is available
    if (!loading && userRole) {
      switch (userRole) {
        case 'admin':
          navigate('/admin');
          break;
        case 'developer':
          navigate('/developer');
          break;
          case 'hr': navigate('/hr'); break;
        case 'tester':
          navigate('/tester');
          break;
        default:
          navigate('/tester'); // Safe default
          break;
      }
    }
  }, [userRole, loading, navigate]);

  // **THE KEY FIX IS HERE**
  // While the role is being fetched, just show the spinner.
  if (loading) {
    return <Spinner />;
  }

  // This fallback will show if something unexpected happens
  return <Spinner />; 
}

export default DashboardRedirect;