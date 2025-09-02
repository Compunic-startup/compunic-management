import React from 'react';

function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        {/* Simple Tailwind CSS Spinner */}
        <div 
          className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"
          role="status"
        >
          <span className="sr-only">Loading...</span>
        </div>
        <p className="mt-4 text-lg font-semibold text-gray-700">Authenticating...</p>
      </div>
    </div>
  );
}

export default Spinner;