
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Initialize users in localStorage if not present
  useEffect(() => {
    const existingUsers = localStorage.getItem('users');
    if (!existingUsers) {
      const initialUsers = [{ username: 'admin', password: 'password' }];
      localStorage.setItem('users', JSON.stringify(initialUsers));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const users = JSON.parse(localStorage.getItem('users') || '[]');

    if (isSignUp) {
      // Sign Up Logic
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      const userExists = users.some((u: any) => u.username.toLowerCase() === username.toLowerCase());
      if (userExists) {
        setError('Username already taken');
        return;
      }

      const newUser = { username, password };
      const updatedUsers = [...users, newUser];
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      setSuccess('Account created successfully! Please sign in.');
      setIsSignUp(false);
      setPassword('');
      setConfirmPassword('');
    } else {
      // Login Logic
      const user = users.find((u: any) => u.username === username && u.password === password);
      
      if (user) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify({ username: user.username }));
        navigate('/');
      } else {
        setError('Invalid username or password');
      }
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setSuccess('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 transition-all duration-300">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">SMK <span className="text-blue-600">MYPROFIT</span></h1>
          <p className="text-slate-500 mt-2">
            {isSignUp ? 'Create your business account' : 'Manage your business finances with ease'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-sm font-medium border border-rose-100 flex items-center animate-in fade-in zoom-in">
              <span className="mr-2">⚠️</span> {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl text-sm font-medium border border-emerald-100 flex items-center animate-in fade-in zoom-in">
              <span className="mr-2">✅</span> {success}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Username</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {isSignUp && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Confirm Password</label>
              <input
                type="password"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
          >
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={toggleMode}
              className="text-blue-600 font-bold hover:underline underline-offset-4"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
          
          {!isSignUp && (
            <p className="text-[10px] text-slate-400 mt-4 italic">
              Default credentials: admin / password
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
