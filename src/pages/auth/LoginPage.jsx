import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { logAdminActivity } from '../../lib/logger';

export default function LoginPage({ onNavigate, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profile && (profile.role === 'admin' || profile.role === 'staff')) {
        const adminName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email;
        await logAdminActivity('Authentication', 'Admin Signed In', adminName, 'Successfully authenticated into the administrative panel.');
      }

      setLoading(false);
      if (onLoginSuccess) onLoginSuccess(data.user.id);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-amber-200">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center text-amber-400 font-black text-xl mx-auto border-2 border-amber-500 shadow-md">
            SA
          </div>
          <h2 className="text-2xl font-black text-zinc-900 mt-3">Sign In to Portal</h2>
          <p className="text-xs text-zinc-500 mt-1">Barangay San Agustin E-Governance Portal</p>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 text-rose-700 p-3 rounded-xl mb-4 text-xs font-semibold border border-rose-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
          <div>
            <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              autoComplete="new-email"
              placeholder=""
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-zinc-300 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">Password</label>
            <input
              type="password"
              required
              autoComplete="new-password"
              placeholder=""
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-zinc-300 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-900 text-amber-400 font-extrabold py-3.5 rounded-xl border border-amber-500 shadow transition hover:bg-black cursor-pointer"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs space-y-2">
          <p className="text-zinc-600">
            Don't have an account?{' '}
            <button
              onClick={() => onNavigate('register')}
              className="font-bold text-zinc-900 hover:underline cursor-pointer"
            >
              Register Here
            </button>
          </p>
          <button
            onClick={() => onNavigate('landing')}
            className="block mx-auto text-zinc-400 hover:text-zinc-900 cursor-pointer"
          >
            Back to Home Page
          </button>
        </div>
      </div>
    </div>
  );
}