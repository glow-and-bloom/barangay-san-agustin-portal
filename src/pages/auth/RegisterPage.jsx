import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function RegisterPage({ onNavigate, setIsRegistering }) {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Resident Form
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  
  useEffect(() => {
    if (setIsRegistering) {
      setIsRegistering(true);
    }
  }, [setIsRegistering]);

  // Resident Form Fields (Step 3)
  const [regData, setRegData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    birth_date: '',
    gender: 'Male',
    civil_status: 'single',
    contact_number: '',
    household_number: '',
    street_address: '',
    purok: 'Purok 1',
    is_head_of_household: false,
    voter_status: 'registered',
    is_pwd: false,
    pwd_id_number: '',
    is_4ps: false,
    four_ps_id: ''
  });

  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);

  // STEP 1: Send OTP Code
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (!email.trim() || !email.includes('@')) {
      setMessage({ text: 'Please enter a valid email address.', type: 'error' });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true
        }
      });

      if (error) throw error;

      setIsLoading(false);
      setMessage({ text: 'Verification code sent! Please check your Gmail inbox.', type: 'success' });
      setTimeout(() => {
        setStep(2);
        setMessage({ text: '', type: '' });
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      setMessage({ text: error.message || 'Failed to send verification code.', type: 'error' });
    }
  };

  // STEP 2: Verify Code (Lumilipat lang sa Step 3 Form nang hindi ginagalaw ang app navigation)
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (!otpCode.trim()) {
      setMessage({ text: 'Please enter the 6-digit verification code.', type: 'error' });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otpCode.trim(),
        type: 'email'
      });

      if (error) throw error;

      setIsLoading(false);
      setMessage({ text: 'Email verified! Please complete your resident record below.', type: 'success' });
      
      setStep(3);
      setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 1200);

    } catch (error) {
      setIsLoading(false);
      setMessage({ text: error.message || 'Invalid or expired code.', type: 'error' });
    }
  };

  // STEP 3: Complete Registration (Dito lang magse-save sa DB tables)
  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (!password || password.length < 6) {
      setMessage({ text: 'Password must be at least 6 characters long.', type: 'error' });
      return;
    }

    setIsLoading(true);

    try {
      // 1. Kunin ang session na ginawa nung nag-verify sa Step 2
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session || !session.user) {
        throw new Error('Session expired. Please restart registration from Step 1.');
      }

      const userId = session.user.id;

      // 2. I-set ang password sa Auth user
      const { error: updateErr } = await supabase.auth.updateUser({ password: password });
      if (updateErr) throw updateErr;

      // 3. I-save sa profiles table
      await supabase.from('profiles').upsert([{
        id: userId,
        first_name: regData.first_name.trim(),
        last_name: regData.last_name.trim(),
        contact_number: regData.contact_number.trim(),
        role: 'resident'
      }]);

      // 4. I-save sa residents table para lumabas sa Admin Dashboard
      const residentPayload = {
        profile_id: userId,
        full_name: `${regData.first_name.trim()} ${regData.last_name.trim()}`,
        first_name: regData.first_name.trim(),
        middle_name: regData.middle_name.trim() || null,
        last_name: regData.last_name.trim(),
        suffix: regData.suffix.trim() || null,
        birth_date: regData.birth_date || null,
        gender: regData.gender || 'Male',
        civil_status: (regData.civil_status || 'single').toLowerCase(),
        contact_number: regData.contact_number.trim() || null,
        email: email.trim(),
        household_number: regData.household_number.trim() || 'HH-PENDING',
        street_address: regData.street_address.trim() || null,
        purok: regData.purok || 'Purok 1',
        is_head_of_household: Boolean(regData.is_head_of_household),
        voter_status: (regData.voter_status || 'registered').toLowerCase(),
        is_pwd: Boolean(regData.is_pwd),
        pwd_id_number: regData.is_pwd ? regData.pwd_id_number.trim() : null,
        is_4ps: Boolean(regData.is_4ps),
        four_ps_id: regData.is_4ps ? regData.four_ps_id.trim() : null,
        vital_status: 'alive'
      };

      const { error: resError } = await supabase.from('residents').insert([residentPayload]);
      if (resError) throw resError;

      // Tapos na ang registration: i-sign out para bumalik sa Login screen nang malinis
      await supabase.auth.signOut();
      if (setIsRegistering) setIsRegistering(false);

      setIsLoading(false);
      alert('Registration successful! Your resident profile has been created.');
      
      if (onNavigate) {
        onNavigate('login');
      } else {
        window.location.reload();
      }

    } catch (error) {
      setIsLoading(false);
      setMessage({ text: error.message || 'Failed to save resident record.', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 flex items-center justify-center p-4 py-8 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full border border-amber-300 space-y-6">
        
        {/* Stepper Header */}
        <div className="flex justify-between items-center mb-6 px-12 relative">
          <div className="absolute left-16 right-16 top-1/2 -translate-y-1/2 h-0.5 bg-zinc-200 z-0"></div>
          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs z-10 ${step === 1 ? 'bg-amber-500 text-white' : step > 1 ? 'bg-zinc-900 text-amber-400' : 'bg-zinc-200 text-zinc-600'}`}>1</div>
          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs z-10 ${step === 2 ? 'bg-amber-500 text-white' : step > 2 ? 'bg-zinc-900 text-amber-400' : 'bg-zinc-200 text-zinc-600'}`}>2</div>
          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs z-10 ${step === 3 ? 'bg-amber-500 text-white' : 'bg-zinc-200 text-zinc-600'}`}>3</div>
        </div>

        {/* STEP 1: Email Input */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-black text-zinc-900">Step 1: Email Verification</h2>
              <p className="text-xs text-zinc-500 mt-1">Enter your active Gmail address to receive a 6-digit verification code.</p>
            </div>
            <form onSubmit={handleSendOtp} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase text-zinc-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="resident@gmail.com"
                  className="w-full border border-zinc-300 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-zinc-900 hover:bg-black text-amber-400 font-extrabold py-3.5 rounded-xl border border-amber-500 shadow transition cursor-pointer text-sm"
              >
                {isLoading ? 'Sending Code...' : 'Send Verification Code'}
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: Input Code */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-black text-zinc-900">Step 2: Verification Code</h2>
              <p className="text-xs text-zinc-500 mt-1">We sent a 6-digit code to <strong>{email}</strong>.</p>
            </div>
            <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase text-zinc-700 mb-1">Enter 6-Digit Code</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  className="w-full border border-zinc-300 p-3 rounded-xl text-center text-xl font-mono tracking-widest outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-zinc-900 hover:bg-black text-amber-400 font-extrabold py-3.5 rounded-xl border border-amber-500 shadow transition cursor-pointer text-sm"
              >
                {isLoading ? 'Verifying Code...' : 'Verify Code & Open Form'}
              </button>
            </form>
          </div>
        )}

        {/* STEP 3: Resident Registration Form */}
        {step === 3 && (
          <form onSubmit={handleCompleteRegistration} className="space-y-5 text-xs">
            <div className="text-center border-b pb-3">
              <h2 className="text-2xl font-black text-zinc-900">Step 3: Resident Form</h2>
              <p className="text-xs text-zinc-500 mt-1">Email verified! Please complete your details to finish registration.</p>
            </div>

            {/* Password */}
            <div className="space-y-2 border-b pb-3">
              <h3 className="font-extrabold uppercase text-amber-600 tracking-wider">Portal Password</h3>
              <div>
                <label className="block font-bold text-zinc-700 uppercase mb-1">Set Password *</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-zinc-300 p-2.5 rounded-xl"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Personal Details */}
            <div className="space-y-2 border-b pb-3">
              <h3 className="font-extrabold uppercase text-amber-600 tracking-wider">Personal Information</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 uppercase mb-1">First Name *</label>
                  <input type="text" required value={regData.first_name} onChange={(e) => setRegData({ ...regData, first_name: e.target.value })} className="w-full border border-zinc-300 p-2 rounded-xl" />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 uppercase mb-1">Middle Name</label>
                  <input type="text" value={regData.middle_name} onChange={(e) => setRegData({ ...regData, middle_name: e.target.value })} className="w-full border border-zinc-300 p-2 rounded-xl" />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 uppercase mb-1">Last Name *</label>
                  <input type="text" required value={regData.last_name} onChange={(e) => setRegData({ ...regData, last_name: e.target.value })} className="w-full border border-zinc-300 p-2 rounded-xl" />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 uppercase mb-1">Suffix</label>
                  <input type="text" value={regData.suffix} onChange={(e) => setRegData({ ...regData, suffix: e.target.value })} className="w-full border border-zinc-300 p-2 rounded-xl" placeholder="Jr." />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block font-bold text-zinc-700 uppercase mb-1">Date of Birth *</label>
                  <input type="date" required value={regData.birth_date} onChange={(e) => setRegData({ ...regData, birth_date: e.target.value })} className="w-full border border-zinc-300 p-2 rounded-xl" />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 uppercase mb-1">Gender *</label>
                  <select value={regData.gender} onChange={(e) => setRegData({ ...regData, gender: e.target.value })} className="w-full border border-zinc-300 p-2 rounded-xl">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 uppercase mb-1">Civil Status</label>
                  <select value={regData.civil_status} onChange={(e) => setRegData({ ...regData, civil_status: e.target.value })} className="w-full border border-zinc-300 p-2 rounded-xl">
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="widowed">Widowed</option>
                    <option value="separated">Separated</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <label className="block font-bold text-zinc-700 uppercase mb-1">Phone Number *</label>
                <input type="text" required value={regData.contact_number} onChange={(e) => setRegData({ ...regData, contact_number: e.target.value })} className="w-full border border-zinc-300 p-2 rounded-xl" placeholder="09123456789" />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2 border-b pb-3">
              <h3 className="font-extrabold uppercase text-amber-600 tracking-wider">Residence Address</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 uppercase mb-1">Household No. *</label>
                  <input type="text" required value={regData.household_number} onChange={(e) => setRegData({ ...regData, household_number: e.target.value })} className="w-full border border-zinc-300 p-2 rounded-xl" placeholder="HH-2026-001" />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 uppercase mb-1">Purok *</label>
                  <select value={regData.purok} onChange={(e) => setRegData({ ...regData, purok: e.target.value })} className="w-full border border-zinc-300 p-2 rounded-xl">
                    <option value="Purok 1">Purok 1</option>
                    <option value="Purok 2">Purok 2</option>
                    <option value="Purok 3">Purok 3</option>
                    <option value="Purok 4">Purok 4</option>
                    <option value="Purok 5">Purok 5</option>
                    <option value="Purok 6">Purok 6</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 uppercase mb-1">Street Address</label>
                  <input type="text" value={regData.street_address} onChange={(e) => setRegData({ ...regData, street_address: e.target.value })} className="w-full border border-zinc-300 p-2 rounded-xl" placeholder="Main St." />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-zinc-900 hover:bg-black text-amber-400 font-extrabold py-3.5 rounded-xl border border-amber-500 shadow transition text-sm cursor-pointer"
            >
              {isLoading ? 'Saving Record...' : 'Complete & Save Registration'}
            </button>
          </form>
        )}

        {/* Message Banner */}
        {message.text && (
          <div className={`p-3 rounded-xl text-xs font-semibold text-center border ${message.type === 'error' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
            {message.text}
          </div>
        )}

        <div className="text-center text-xs pt-2">
          <button 
            onClick={() => {
              if (setIsRegistering) setIsRegistering(false);
              if (onNavigate) onNavigate('login');
            }} 
            className="text-zinc-500 hover:text-zinc-900 font-semibold cursor-pointer"
          >
            Already have an account? Sign In
          </button>
        </div>

      </div>
    </div>
  );
}