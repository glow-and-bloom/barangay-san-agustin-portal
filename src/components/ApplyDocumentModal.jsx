import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Upload, Copy, Sparkles } from 'lucide-react';
import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID = 'service_7p37ngs';
const EMAILJS_TEMPLATE_ID_ADMIN = 'template_77p945r';
const EMAILJS_TEMPLATE_ID_RESIDENT = 'template_30v2pth';
const EMAILJS_PUBLIC_KEY = 'l7wGC4bm9gnhdlvcb';
const ADMIN_EMAIL = 'brgy.sanagustin301@gmail.com';

const PURPOSE_OPTIONS = [
  'Employment',
  'School Enrollment',
  'Scholarship Application',
  'Local Employment',
  'Business Application',
  'Financial Assistance',
  'Medical Assistance',
  'Travel Requirement',
  'Personal Use',
  'Other'
];

export default function ApplyDocumentModal({
  isOpen,
  onClose,
  documentTitle = 'Certificate of Indigency'
}) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [photo1x1, setPhoto1x1] = useState('');
  const [proofResidence, setProofResidence] = useState('');
  const [fullName, setFullName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [age, setAge] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [purpose, setPurpose] = useState('');
  const [otherPurpose, setOtherPurpose] = useState('');
  const [trackingCode, setTrackingCode] = useState('');

  if (!isOpen) return null;

  const isBusinessPermit = documentTitle.toLowerCase().includes('business');
  const docFee = isBusinessPermit ? 50 : 0;

  const inputClass =
    'w-full bg-amber-50/30 border border-amber-300 text-zinc-900 p-2.5 rounded-xl outline-none focus:border-amber-500 font-semibold';

  const labelClass =
    'block text-zinc-700 font-black uppercase text-[10px] mb-1';

  const handleFileConvert = (e, setBase64State) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file.');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must not exceed 5MB.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => setBase64State(reader.result);
    reader.readAsDataURL(file);
  };

  const generateTrackingCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    return Array.from(
      { length: 20 },
      () => chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('');
  };

  // Email para sa ADMIN kapag may nag-submit ng request.
  // - from_name = pangalan + email ng resident
  // - reply_to = email ng resident (sa kanya mapupunta ang Reply ng admin)
  const sendAdminNotification = async (payload) => {
    const templateParams = {
      from_name: `${payload.full_name} - ${payload.email}`,
      reply_to: payload.email,

      resident_name: payload.full_name,
      resident_email: payload.email,
      contact_number: payload.contact_number,
      address: payload.address,
      document_type: payload.document_type,
      purpose: payload.purpose,
      tracking_number: payload.tracking_number,
      time: new Date().toLocaleString('en-PH')
    };

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID_ADMIN,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      console.log('Admin notification sent successfully.');
      return true;
    } catch (error) {
      console.error('Admin notification failed:', error?.text || error);
      return false;
    }
  };

  // Email para sa RESIDENT na nagsasabing natanggap na ang request niya.
  // - to_email = email na inilagay ng resident sa form
  // - galing sa Gmail ng barangay (ang naka-connect sa EmailJS)
  // - reply_to = email ng admin
  const sendResidentConfirmation = async (payload) => {
    const templateParams = {
      to_email: payload.email,
      to_name: payload.full_name,
      from_name: 'Barangay San Agustin Office',
      reply_to: ADMIN_EMAIL,

      resident_name: payload.full_name,
      resident_email: payload.email,
      tracking_number: payload.tracking_number,
      document_type: payload.document_type,
      status: 'RECEIVED',
      pickup_schedule: 'Not yet scheduled',
      message:
        `Hi, ${payload.full_name}! We have received your requested ${payload.document_type}. ` +
        `It is now being processed by our team. ` +
        `To track your requested document, please use this tracking code ${payload.tracking_number}. ` +
        `Please be aware that before you may pick up your requested ${payload.document_type}, ` +
        `you must present a valid ID or other kind of identification that verifies your identity. ` +
        `We really appreciate you choosing to use our system to get your ${payload.document_type} online.`
    };

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID_RESIDENT,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      console.log('Resident confirmation sent successfully.');
      return true;
    } catch (error) {
      console.error('Resident confirmation failed:', error?.text || error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    const finalPurpose = purpose === 'Other'
      ? otherPurpose.trim()
      : purpose;

    if (!fullName.trim() || !email.trim() || !finalPurpose) {
      alert('Please complete all required fields.');
      return;
    }

    if (!photo1x1 || !proofResidence) {
      alert('Please upload both required images.');
      return;
    }

    if (!birthday || !age || Number(age) < 1 || Number(age) > 120) {
      alert('Please enter a valid birthday and age.');
      return;
    }

    setLoading(true);

    const generatedCode = generateTrackingCode();

    const payload = {
      tracking_number: generatedCode,
      document_type: documentTitle,
      full_name: fullName.trim(),
      birthday,
      age: parseInt(age, 10),
      contact_number: contactNumber.trim(),
      email: email.trim(),
      address: address.trim(),
      purpose: finalPurpose,
      fee: docFee,
      photo_1x1: photo1x1,
      proof_residence: proofResidence,
      status: 'submitted'
    };

    try {
      const { error } = await supabase
        .from('document_requests')
        .insert([payload]);

      if (error) throw error;

      setTrackingCode(generatedCode);
      setStep(4);

      const [adminSent, residentSent] = await Promise.all([
        sendAdminNotification(payload),
        sendResidentConfirmation(payload)
      ]);

      if (!adminSent) {
        alert(
          'Your request was submitted successfully, but the admin email notification could not be sent.'
        );
      }

      if (!residentSent) {
        alert(
          'Your request was submitted successfully, but we could not send the confirmation email. Please save your tracking code.'
        );
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Error submitting request: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    if (loading) return;

    setStep(1);
    setPhoto1x1('');
    setProofResidence('');
    setFullName('');
    setBirthday('');
    setAge('');
    setContactNumber('');
    setEmail('');
    setAddress('');
    setPurpose('');
    setOtherPurpose('');
    setTrackingCode('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans selection:bg-amber-400 selection:text-zinc-950">
      <div className="bg-white border-2 border-amber-400 rounded-3xl w-full max-w-2xl text-zinc-900 p-6 sm:p-8 shadow-2xl relative overflow-y-auto max-h-[90vh]">

        <button
          type="button"
          onClick={resetAndClose}
          disabled={loading}
          className="absolute right-5 top-5 text-zinc-400 hover:text-amber-600 transition cursor-pointer"
        >
          <X size={22} />
        </button>

        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                DOCUMENT APPLICATION
              </span>

              <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
                {documentTitle}
              </h2>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-zinc-700 leading-relaxed bg-amber-50/40 p-5 rounded-2xl border border-amber-200">
              <div>
                <h4 className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
                  <Sparkles size={16} className="text-amber-600" />
                  What is {documentTitle}?
                </h4>
                <p className="mt-1 text-zinc-600">
                  An official document issued by Barangay San Agustin for bona fide residents.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-amber-900 text-sm">
                  Document Fee
                </h4>
                <p className="mt-1 font-extrabold text-amber-800">
                  {docFee === 0 ? 'FREE / WALANG BAYAD (₱0)' : `₱${docFee}.00`}
                </p>
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={resetAndClose}
                className="w-1/2 py-3 rounded-xl border-2 border-amber-300 text-amber-900 font-black text-xs uppercase hover:bg-amber-50 transition cursor-pointer"
              >
                Back to Website
              </button>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-1/2 py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-zinc-950 font-black text-xs uppercase shadow-md transition border border-amber-300 cursor-pointer"
              >
                Proceed
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-zinc-950 text-center">
              {documentTitle} Requirements
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="border-2 border-amber-300 p-4 rounded-2xl flex flex-col justify-center items-center bg-amber-50/50">
                <span className="text-xs font-black uppercase text-amber-800">
                  DOCUMENT FEE
                </span>
                <span className="text-2xl font-black text-zinc-950 my-1">
                  {docFee === 0 ? 'FREE' : `₱${docFee}`}
                </span>
              </div>

              <div className="flex flex-col justify-between items-center bg-white border-2 border-amber-300 p-4 rounded-2xl shadow-sm">
                <span className="text-xs font-black text-amber-900 mb-2">
                  1x1 Picture
                </span>

                <div className="w-24 h-24 bg-amber-50 rounded-2xl border-2 border-dashed border-amber-400 flex items-center justify-center overflow-hidden">
                  {photo1x1 ? (
                    <img src={photo1x1} alt="1x1" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="text-amber-500" size={24} />
                  )}
                </div>

                <label className="mt-3 w-full py-2 bg-amber-400 hover:bg-amber-500 text-zinc-950 font-black text-[10px] uppercase rounded-xl cursor-pointer transition text-center">
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => handleFileConvert(e, setPhoto1x1)}
                  />
                </label>
              </div>

              <div className="flex flex-col justify-between items-center bg-white border-2 border-amber-300 p-4 rounded-2xl shadow-sm">
                <span className="text-xs font-black text-amber-900 mb-2">
                  Proof of Residence
                </span>

                <div className="w-24 h-24 bg-amber-50 rounded-2xl border-2 border-dashed border-amber-400 flex items-center justify-center overflow-hidden">
                  {proofResidence ? (
                    <img src={proofResidence} alt="Residence" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="text-amber-500" size={24} />
                  )}
                </div>

                <label className="mt-3 w-full py-2 bg-amber-400 hover:bg-amber-500 text-zinc-950 font-black text-[10px] uppercase rounded-xl cursor-pointer transition text-center">
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => handleFileConvert(e, setProofResidence)}
                  />
                </label>
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/2 py-3 rounded-xl border-2 border-amber-300 text-amber-900 font-black text-xs uppercase hover:bg-amber-50 transition cursor-pointer"
              >
                Previous
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!photo1x1 || !proofResidence) {
                    alert('Please upload both requirements.');
                    return;
                  }
                  setStep(3);
                }}
                className="w-1/2 py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-zinc-950 font-black text-xs uppercase shadow-md transition border border-amber-300 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-black text-zinc-950 text-center">
              {documentTitle} Application Form
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className={labelClass}>Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="Juan Dela Cruz"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Birthday</label>
                <input
                  required
                  type="date"
                  value={birthday}
                  onChange={e => setBirthday(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Age</label>
                <input
                  required
                  type="number"
                  min="1"
                  max="120"
                  placeholder="Age"
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Contact Number</label>
                <input
                  required
                  type="tel"
                  placeholder="Ex. 09123456789"
                  value={contactNumber}
                  onChange={e => setContactNumber(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Email Address</label>
                <input
                  required
                  type="email"
                  placeholder="juan@gmail.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-4">
                <label className={labelClass}>Address</label>
                <input
                  required
                  type="text"
                  placeholder="Ex. 123 Barangay San Agustin"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-4">
                <label className={labelClass}>Purpose of Request</label>
                <select
                  required
                  value={purpose}
                  onChange={e => {
                    setPurpose(e.target.value);
                    setOtherPurpose('');
                  }}
                  className={inputClass}
                >
                  <option value="">Select purpose of request</option>
                  {PURPOSE_OPTIONS.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {purpose === 'Other' && (
                <div className="sm:col-span-4">
                  <label className={labelClass}>Specify Purpose</label>
                  <input
                    required
                    type="text"
                    placeholder="Enter your purpose"
                    value={otherPurpose}
                    onChange={e => setOtherPurpose(e.target.value)}
                    className={inputClass}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-1/2 py-3 rounded-xl border-2 border-amber-300 text-amber-900 font-black text-xs uppercase hover:bg-amber-50 transition cursor-pointer"
              >
                Previous
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-1/2 py-3 rounded-xl bg-amber-400 hover:bg-amber-500 disabled:opacity-60 text-zinc-950 font-black text-xs uppercase shadow-md transition border border-amber-300 cursor-pointer"
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        )}

        {step === 4 && (
          <div className="space-y-4 text-center">
            <h2 className="text-xl sm:text-2xl font-black text-amber-900 uppercase">
              {documentTitle} Submitted
            </h2>

            <div className="bg-amber-50/80 border-2 border-amber-400 p-5 rounded-3xl space-y-2 shadow-inner">
              <span className="text-xs font-black uppercase text-amber-800 block">
                Tracking Code:
              </span>

              <div className="text-base sm:text-xl font-black font-mono tracking-widest text-zinc-950 bg-white py-2.5 px-4 rounded-xl border-2 border-amber-300 flex items-center justify-center gap-2 break-all">
                <span>{trackingCode}</span>

                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(trackingCode)}
                  className="text-amber-700 hover:text-amber-900 cursor-pointer"
                  title="Copy tracking code"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={resetAndClose}
              className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-zinc-950 font-black text-xs uppercase rounded-xl shadow cursor-pointer border border-amber-300"
            >
              Back to Website
            </button>
          </div>
        )}
      </div>
    </div>
  );
}