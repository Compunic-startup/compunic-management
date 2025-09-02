import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';

function UnauthorizedPage() {
  const { userRole, loading } = useAuth();
  const navigate = useNavigate();

  // --- NEW: State to control showing the error message ---
  const [showTimeoutError, setShowTimeoutError] = useState(false);

  // This effect handles the successful redirection.
  // It runs whenever the user's role is determined.
  useEffect(() => {
    if (!loading && userRole) {
      // If we have a role, redirect immediately.
      switch (userRole) {
        case 'admin':
          navigate('/admin', { replace: true });
          break;
        case 'developer':
          navigate('/developer', { replace: true });
          break;
        case 'hr':
          navigate('/hr', { replace: true });
          break;
        case 'tester':
          navigate('/tester', { replace: true });
          break;
        default:
          navigate('/', { replace: true }); // Fallback to a safe default
          break;
      }
    }
  }, [userRole, loading, navigate]);

  // --- NEW: This effect handles the 10-second timeout ---
  useEffect(() => {
    // Start a timer when the component loads.
    const timer = setTimeout(() => {
      // If this timer completes, it means we've waited 10 seconds
      // and still don't have a user role. We should show an error.
      setShowTimeoutError(true);
    }, 10000); // 10,000 milliseconds = 10 seconds

    // This is a crucial cleanup function. If the component unmounts
    // (because the user was successfully redirected), we clear the timer
    // to prevent the error from showing unnecessarily.
    return () => clearTimeout(timer);
  }, []); // The empty array ensures this effect runs only once.

  // --- Conditional Rendering Logic ---
  if (showTimeoutError) {
    // If the 10-second timer has finished, show the error message.
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <div className="text-center p-8 bg-white shadow-lg rounded-xl">
          <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="mt-4 text-2xl font-bold text-slate-800">Authorization Timed Out</h1>
          <p className="mt-2 text-base text-slate-600">We couldn't verify your permissions in time. This might be due to a network issue.</p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              Login Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // While we are waiting (and before the timeout), show the spinner.
  return <Spinner />;
}

export default UnauthorizedPage;