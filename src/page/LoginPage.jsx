import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err) {
      setError('Failed to log in. Please check your credentials.');
      console.error("Firebase Auth Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // This style tag contains the CSS for our background animations
  const animationStyle = `
    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
      100% { transform: translateY(0px); }
    }
    .float-1 { animation: float 6s ease-in-out infinite; }
    .float-2 { animation: float 7s ease-in-out infinite 1s; }
    .float-3 { animation: float 8s ease-in-out infinite 0.5s; }
    .float-4 { animation: float 9s ease-in-out infinite 1.5s; }
  `;

  return (
    <>
      <style>{animationStyle}</style>
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="relative w-full max-w-4xl flex flex-col md:flex-row bg-white shadow-2xl rounded-2xl overflow-hidden">
          
          {/* Left Side: The Animated Showcase (Formerly on the Right) */}
          <div className="hidden md:flex w-1/2 bg-slate-800 p-12 items-center justify-center relative overflow-hidden">
             <div className="text-white text-center z-10">
                <h2 className="text-3xl font-bold">Your Project Command Center</h2>
                <p className="mt-2 text-slate-300">Track, resolve, and innovate with precision.</p>
             </div>
             {/* Floating Animated Elements */}
             <div className="absolute top-10 left-10 w-24 h-24 bg-indigo-500/20 rounded-full float-1"></div>
             <div className="absolute bottom-12 right-12 w-32 h-32 bg-sky-500/20 rounded-full float-2"></div>
             <div className="absolute top-1/2 right-20 text-slate-700 font-bold text-2xl float-3">bill365</div>
             <div className="absolute top-1/3 left-20 text-slate-700 font-bold text-2xl float-4">mealx</div>
             <div className="absolute bottom-1/4 left-1/2 text-slate-700 font-mono text-xl float-2">&lt;/&gt;</div>
          </div>

          {/* Right Side: The Form (Formerly on the Left) */}
          <div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
            <div className="text-center md:text-left">
              {/* You can replace this with your actual logo SVG or <img> */}
              <h1 className="text-3xl font-bold text-slate-800">Compunic</h1>
              <p className="text-slate-500 mt-2">Token Management Portal</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
                <div className="mt-1 relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                  </span>
                  <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="you@compunic.com" required />
                </div>
              </div>

              <div>
                <label htmlFor="password"className="block text-sm font-medium text-slate-700">Password</label>
                <div className="mt-1 relative">
                   <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </span>
                  <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="••••••••" required />
                </div>
              </div>

              {error && (
                <div className="p-3 text-sm text-center text-red-800 bg-red-100 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <button type="submit" disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 hover:shadow-indigo-500/50"
                >
                  {loading ? 'Signing In...' : 'Sign In Securely'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginPage;