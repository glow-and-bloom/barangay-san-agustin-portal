const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Temporary in-memory storage
const otpStorage = {}; 
const registeredUsers = []; 

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 1. Send OTP Endpoint
app.post('/api/send-otp', async (req, res) => {
  const { identifier } = req.body;

  if (!identifier || !identifier.includes('@')) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
  }

  const exists = registeredUsers.some(user => user.identifier.toLowerCase() === identifier.toLowerCase());
  if (exists) {
    return res.status(400).json({ success: false, message: 'This email is already registered.' });
  }

  const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
  
  otpStorage[identifier] = {
    code: otpCode,
    expires: Date.now() + 5 * 60 * 1000,
  };

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: identifier,
    subject: 'Your Verification Code',
    text: `Your secure verification code is: ${otpCode}. It will expire in 5 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Verification code sent successfully to your email.' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, message: 'Failed to send email. Please check server configuration.' });
  }
});

// 2. Verify OTP Endpoint
app.post('/api/verify-otp', (req, res) => {
  const { identifier, code } = req.body;
  const record = otpStorage[identifier];

  if (!record) {
    return res.status(400).json({ success: false, message: 'No verification code requested for this email.' });
  }

  if (Date.now() > record.expires) {
    delete otpStorage[identifier];
    return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new one.' });
  }

  if (record.code !== code) {
    return res.status(400).json({ success: false, message: 'Invalid verification code.' });
  }

  delete otpStorage[identifier];
  res.json({ success: true, message: 'Email verified successfully!' });
});

// 3. Complete Registration Endpoint
app.post('/api/register', (req, res) => {
  const { identifier, fullName, password } = req.body;

  const exists = registeredUsers.some(user => user.identifier.toLowerCase() === identifier.toLowerCase());
  if (exists) {
    return res.status(400).json({ success: false, message: 'Account already exists.' });
  }

  registeredUsers.push({ identifier, fullName, password });
  res.json({ success: true, message: 'Registration completed successfully!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});