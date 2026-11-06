import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Camera, Upload, UserPlus, X, ArrowLeft } from 'lucide-react';

export default function RegisterPage({ onNavigate, setIsRegistering }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [householdLeaders, setHouseholdLeaders] = useState([]);
  
  // Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [previewPhoto, setPreviewPhoto] = useState(null);

  useEffect(() => {
    if (setIsRegistering) setIsRegistering(true);
    fetchHouseholdLeaders();
  }, [setIsRegistering]);

  const fetchHouseholdLeaders = async () => {
    const { data } = await supabase.from('residents').select('id, first_name, last_name, household_number').eq('is_head_of_household', true);
    if (data) setHouseholdLeaders(data);
  };

  const initialRegData = {
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    birth_date: '',
    gender: 'Male',
    civil_status: 'Single',
    contact_number: '',
    household_number: '',
    street_address: '',
    purok: 'Purok 1',
    residency_type: 'since_birth',
    years_of_residency: '',
    is_head_of_household: false,
    household_leader_id: '',
    voter_status: 'registered',
    is_pwd: false,
    pwd_id_number: '',
    is_4ps: false,
    four_ps_id: ''
  };

  const [regData, setRegData] = useState(initialRegData);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);

  // KANSELASYON: Ibabalik sa Landing Page nang hindi mag-iwan ng sesyon o save sa database
  const handleCancelRegistration = async () => {
    const confirmCancel = window.confirm('Sigurado ka bang gusto mong i-cancel? Hindi mai-save ang iyong impormasyon.');
    if (!confirmCancel) return;

    try {
      await supabase.auth.signOut();
    } catch (err) {}

    setEmail('');
    setOtpCode('');
    setPassword('');
    setPreviewPhoto(null);
    setRegData(initialRegData);
    setMessage({ text: '', type: '' });
    setStep(1);

    if (setIsRegistering) setIsRegistering(false);
    
    if (onNavigate) {
      onNavigate('landing');
    }
  };

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert(`Camera error: ${err.message}`);
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      setPreviewPhoto(canvas.toDataURL('image/jpeg'));
      stopCamera();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setPreviewPhoto(event.target.result);
    reader.readAsDataURL(file);
  };

  const uploadPhotoToSupabase = async (base64OrBlob) => {
    if (!base64OrBlob) return null;
    try {
      const res = await fetch(base64OrBlob);
      const blob = await res.blob();
      const fileName = `resident_${Date.now()}.jpg`;

      const { error } = await supabase.storage.from('resident-photos').upload(fileName, blob, { contentType: 'image/jpeg' });
      if (error) throw error;

      const { data: publicUrlData } = supabase.storage.from('resident-photos').getPublicUrl(fileName);
      return publicUrlData.publicUrl;
    } catch (err) {
      return null;
    }
  };

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
          shouldCreateUser: true,
          // Note: Para mapalitan ang hitsura o pangalan ng nagpapadala, 
          // kailangan naka-configure ang Custom SMTP sa iyong Supabase Dashboard (Authentication > Providers / Email Templates)
        } 
      });
      if (error) throw error;
      setIsLoading(false);
      setMessage({ text: 'Verification code sent! Please check your Gmail inbox.', type: 'success' });
      setTimeout(() => { setStep(2); setMessage({ text: '', type: '' }); }, 1000);
    } catch (error) {
      setIsLoading(false);
      setMessage({ text: error.message || 'Failed to send code.', type: 'error' });
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    if (!otpCode.trim()) {
      setMessage({ text: 'Please enter the 6-digit verification code.', type: 'error' });
      return;
    }
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: otpCode.trim(), type: 'email' });
      if (error) throw error;
      setIsLoading(false);
      setStep(3);
    } catch (error) {
      setIsLoading(false);
      setMessage({ text: error.message || 'Invalid code.', type: 'error' });
    }
  };

  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (!password || password.length < 6) {
      setMessage({ text: 'Password must be at least 6 characters long.', type: 'error' });
      return;
    }

    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) throw new Error('Session expired.');

      const userId = session.user.id;
      const uploadedPhotoUrl = await uploadPhotoToSupabase(previewPhoto);

      const { error: updateErr } = await supabase.auth.updateUser({ password });
      if (updateErr) throw updateErr;

      await supabase.from('profiles').upsert([{
        id: userId,
        first_name: regData.first_name.trim(),
        last_name: regData.last_name.trim(),
        contact_number: regData.contact_number.trim() || null,
        role: 'resident'
      }]);

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
        residency_type: regData.residency_type,
        years_of_residency: regData.residency_type === 'since_birth' ? null : (parseInt(regData.years_of_residency) || 0),
        is_head_of_household: Boolean(regData.is_head_of_household),
        household_leader_id: regData.is_head_of_household ? null : (regData.household_leader_id || null),
        voter_status: (regData.voter_status || 'registered').toLowerCase(),
        is_pwd: Boolean(regData.is_pwd),
        pwd_id_number: regData.is_pwd ? regData.pwd_id_number.trim() : null,
        is_4ps: Boolean(regData.is_4ps),
        four_ps_id: regData.is_4ps ? regData.four_ps_id.trim() : null,
        vital_status: 'alive',
        photo_url: uploadedPhotoUrl
      };

      const { error: resError } = await supabase.from('residents').insert([residentPayload]);
      if (resError) throw resError;

      await supabase.auth.signOut();
      if (setIsRegistering) setIsRegistering(false);
      setIsLoading(false);

      alert('Registration successful! Please sign in with your account.');
      if (onNavigate) onNavigate('login');
    } catch (error) {
      setIsLoading(false);
      setMessage({ text: error.message || 'Failed to save record.', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 flex items-center justify-center p-3 font-sans">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full border border-amber-300 p-5 space-y-3 my-auto">
        
        {/* Step Stepper Navigation Header */}
        <div className="flex justify-between items-center px-16 relative mb-1">
          <div className="absolute left-20 right-20 top-1/2 -translate-y-1/2 h-0.5 bg-zinc-200 z-0"></div>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs z-10 ${step === 1 ? 'bg-amber-500 text-white' : step > 1 ? 'bg-zinc-900 text-amber-400' : 'bg-zinc-200 text-zinc-600'}`}>1</div>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs z-10 ${step === 2 ? 'bg-amber-500 text-white' : step > 2 ? 'bg-zinc-900 text-amber-400' : 'bg-zinc-200 text-zinc-600'}`}>2</div>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs z-10 ${step === 3 ? 'bg-amber-500 text-white' : 'bg-zinc-200 text-zinc-600'}`}>3</div>
        </div>

        {/* STEP 1: EMAIL VERIFICATION */}
        {step === 1 && (
          <div className="space-y-4 max-w-md mx-auto py-4">
            <form onSubmit={handleSendOtp} className="space-y-3 text-xs">
              <h2 className="text-xl font-black text-zinc-900 text-center">Step 1: Email Verification</h2>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="resident@gmail.com" className="w-full border border-zinc-300 p-2.5 rounded-xl text-xs" />
              <button type="submit" disabled={isLoading} className="w-full bg-zinc-900 text-amber-400 font-extrabold py-2.5 rounded-xl border border-amber-500 text-xs cursor-pointer">
                {isLoading ? 'Sending...' : 'Send Verification Code'}
              </button>
            </form>

            <div className="pt-2 text-center">
              <button 
                type="button" 
                onClick={async () => { 
                  try { await supabase.auth.signOut(); } catch (e) {}
                  if (setIsRegistering) setIsRegistering(false); 
                  if (onNavigate) onNavigate('landing'); 
                }}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-900 font-bold cursor-pointer"
              >
                <ArrowLeft size={14} /> Back to Home
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: VERIFICATION CODE */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-3 text-xs max-w-md mx-auto py-4">
            <h2 className="text-xl font-black text-zinc-900 text-center">Step 2: Verification Code</h2>
            <input type="text" required maxLength={6} value={otpCode} onChange={(e) => setOtpCode(e.target.value)} placeholder="123456" className="w-full border border-zinc-300 p-2.5 rounded-xl text-center text-lg font-mono" />
            <button type="submit" disabled={isLoading} className="w-full bg-zinc-900 text-amber-400 font-extrabold py-2.5 rounded-xl border border-amber-500 text-xs cursor-pointer">
              {isLoading ? 'Verifying...' : 'Verify Code & Open Form'}
            </button>
          </form>
        )}

        {/* STEP 3: RESIDENT FORM */}
        {step === 3 && (
          <div className="space-y-3">
            <div className="flex justify-between items-start border-b border-zinc-100 pb-2">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-zinc-900 text-amber-400 rounded-lg">
                  <UserPlus size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Add Resident Profile</h3>
                  <p className="text-[10px] text-zinc-500">Record complete personal, demographic, and household information.</p>
                </div>
              </div>
              <button type="button" onClick={handleCancelRegistration} className="text-zinc-400 hover:text-zinc-700 p-1 rounded-lg cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCompleteRegistration} className="space-y-2.5 text-xs">
              
              <div className="flex items-center space-x-3 p-2 bg-zinc-50/50 border border-zinc-200 rounded-xl">
                {previewPhoto ? (
                  <img src={previewPhoto} alt="Preview" className="w-12 h-12 rounded-full object-cover border-2 border-amber-500 flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-zinc-200 flex flex-col items-center justify-center text-zinc-500 font-bold text-[9px] leading-tight flex-shrink-0">
                    <span>No</span>
                    <span>Photo</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <button type="button" onClick={startCamera} className="px-3 py-1 bg-zinc-900 text-amber-400 text-[11px] font-bold rounded-xl flex items-center gap-1 cursor-pointer">
                    <Camera size={12} /> Snap Photo
                  </button>
                  <label className="px-3 py-1 bg-white border border-zinc-300 text-zinc-700 text-[11px] font-bold rounded-xl flex items-center gap-1 cursor-pointer">
                    <Upload size={12} /> Upload File
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="p-2 bg-amber-50/50 border border-amber-200 rounded-xl flex items-center gap-3">
                <label className="block text-[10px] font-bold text-amber-900 uppercase whitespace-nowrap">SET ACCOUNT PASSWORD *</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-amber-300 p-1.5 rounded-lg text-xs bg-white" placeholder="••••••••" />
              </div>

              <div className="space-y-1.5">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600 border-b pb-0.5">
                  1. PERSONAL INFORMATION
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[9px] font-bold text-zinc-700 uppercase mb-0.5">FIRST NAME *</label>
                    <input type="text" required value={regData.first_name} onChange={(e) => setRegData({ ...regData, first_name: e.target.value })} className="w-full border border-zinc-300 p-1.5 rounded-lg text-xs" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-zinc-700 uppercase mb-0.5">MIDDLE NAME</label>
                    <input type="text" value={regData.middle_name} onChange={(e) => setRegData({ ...regData, middle_name: e.target.value })} className="w-full border border-zinc-300 p-1.5 rounded-lg text-xs" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-zinc-700 uppercase mb-0.5">LAST NAME *</label>
                    <input type="text" required value={regData.last_name} onChange={(e) => setRegData({ ...regData, last_name: e.target.value })} className="w-full border border-zinc-300 p-1.5 rounded-lg text-xs" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-zinc-700 uppercase mb-0.5">SUFFIX</label>
                    <input type="text" value={regData.suffix} onChange={(e) => setRegData({ ...regData, suffix: e.target.value })} className="w-full border border-zinc-300 p-1.5 rounded-lg text-xs" placeholder="Jr." />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[9px] font-bold text-zinc-700 uppercase mb-0.5">BIRTH DATE *</label>
                    <input type="date" required value={regData.birth_date} onChange={(e) => setRegData({ ...regData, birth_date: e.target.value })} className="w-full border border-zinc-300 p-1.5 rounded-lg text-xs" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-zinc-700 uppercase mb-0.5">GENDER *</label>
                    <select value={regData.gender} onChange={(e) => setRegData({ ...regData, gender: e.target.value })} className="w-full border border-zinc-300 p-1.5 rounded-lg text-xs bg-white">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-zinc-700 uppercase mb-0.5">CIVIL STATUS</label>
                    <select value={regData.civil_status} onChange={(e) => setRegData({ ...regData, civil_status: e.target.value })} className="w-full border border-zinc-300 p-1.5 rounded-lg text-xs bg-white">
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Widowed">Widowed</option>
                      <option value="Separated">Separated</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600 border-b pb-0.5">
                  2. HOUSEHOLD & RESIDENCY LENGTH
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[9px] font-bold text-zinc-700 uppercase mb-0.5">HOUSEHOLD NUMBER *</label>
                    <input type="text" required value={regData.household_number} onChange={(e) => setRegData({ ...regData, household_number: e.target.value })} className="w-full border border-zinc-300 p-1.5 rounded-lg text-xs" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-zinc-700 uppercase mb-0.5">PUROK *</label>
                    <select value={regData.purok} onChange={(e) => setRegData({ ...regData, purok: e.target.value })} className="w-full border border-zinc-300 p-1.5 rounded-lg text-xs bg-white">
                      <option value="Purok 1">Purok 1</option>
                      <option value="Purok 2">Purok 2</option>
                      <option value="Purok 3">Purok 3</option>
                      <option value="Purok 4">Purok 4</option>
                      <option value="Purok 5">Purok 5</option>
                      <option value="Purok 6">Purok 6</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-zinc-700 uppercase mb-0.5">STREET ADDRESS</label>
                    <input type="text" value={regData.street_address} onChange={(e) => setRegData({ ...regData, street_address: e.target.value })} className="w-full border border-zinc-300 p-1.5 rounded-lg text-xs" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                  <div>
                    <label className="block text-[9px] font-bold text-zinc-700 uppercase mb-0.5">LENGTH OF RESIDENCY *</label>
                    <select value={regData.residency_type} onChange={(e) => setRegData({ ...regData, residency_type: e.target.value })} className="w-full border border-zinc-300 p-1.5 rounded-lg text-xs bg-white">
                      <option value="since_birth">Since Birth</option>
                      <option value="custom">Specify Years (Custom)</option>
                    </select>
                  </div>

                  {regData.residency_type === 'custom' && (
                    <div>
                      <label className="block text-[9px] font-bold text-zinc-700 uppercase mb-0.5">NUMBER OF YEARS *</label>
                      <input type="number" required min="1" max="100" value={regData.years_of_residency} onChange={(e) => setRegData({ ...regData, years_of_residency: e.target.value })} className="w-full border border-zinc-300 p-1.5 rounded-lg text-xs" />
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 pt-0.5">
                  <input type="checkbox" id="is_head_reg" checked={regData.is_head_of_household} onChange={(e) => setRegData({ ...regData, is_head_of_household: e.target.checked })} className="rounded text-amber-500" />
                  <label htmlFor="is_head_reg" className="text-[11px] font-bold text-zinc-800">Set as Head / Leader of Household</label>
                </div>

                {!regData.is_head_of_household && (
                  <div className="pt-0.5">
                    <label className="block text-[9px] font-bold text-zinc-700 uppercase mb-0.5">SELECT HOUSEHOLD LEADER</label>
                    <select value={regData.household_leader_id} onChange={(e) => setRegData({ ...regData, household_leader_id: e.target.value })} className="w-full border border-zinc-300 p-1.5 rounded-lg text-xs bg-white">
                      <option value="">-- Select Household Leader --</option>
                      {householdLeaders.map(leader => (
                        <option key={leader.id} value={leader.id}>
                          {leader.first_name} {leader.last_name} (HH: {leader.household_number || 'N/A'})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-zinc-100">
                <button type="button" onClick={handleCancelRegistration} className="px-4 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-xl text-xs cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={isLoading} className="px-6 py-1.5 bg-zinc-900 hover:bg-black text-amber-400 font-extrabold rounded-xl border border-amber-500/50 shadow text-xs cursor-pointer">
                  {isLoading ? 'Saving Record...' : 'Save Resident Record'}
                </button>
              </div>

            </form>
          </div>
        )}

        {message.text && (
          <div className={`p-2 rounded-xl text-xs font-semibold text-center border ${message.type === 'error' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
            {message.text}
          </div>
        )}

      </div>

      {isCameraOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-4 max-w-md w-full space-y-3 text-center shadow-2xl">
            <h3 className="text-sm font-black text-zinc-900 uppercase">Capture Profile Photo</h3>
            <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
              <canvas ref={canvasRef} className="hidden"></canvas>
            </div>
            <div className="flex justify-center space-x-3">
              <button onClick={stopCamera} className="px-4 py-2 bg-zinc-200 text-zinc-800 font-bold rounded-xl text-xs cursor-pointer">Cancel</button>
              <button onClick={capturePhoto} className="px-5 py-2 bg-amber-500 text-black font-extrabold rounded-xl text-xs cursor-pointer shadow">Snap Photo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}