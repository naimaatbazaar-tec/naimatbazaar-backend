import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import asyncHandler from '../utils/asyncHandler.js';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const sanitizeUser = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    role: user.role,
    authProvider: user.authProvider,
  };
};

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ success: false, message: 'Email already registered' });
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    authProvider: 'local',
  });

  const token = generateToken(user);
  res.status(201).json({
    success: true,
    data: { token, user: sanitizeUser(user) },
  });
});


// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 🛠️ FIX: Explicitly include +role and +status so they aren't skipped
  const user = await User.findOne({ email }).select('+password +role +status');
  if (!user || user.authProvider !== 'local') {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  if (user.status === 'blocked') {
    return res.status(403).json({ success: false, message: 'Account has been blocked' });
  }

  const token = generateToken(user);
  res.json({
    success: true,
    data: { token, user: sanitizeUser(user) },
  });
});

// POST /api/auth/google
export const googleAuth = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ success: false, message: 'Google ID token is required' });
  }

  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const { sub: googleId, email, name } = payload;

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name,
      email,
      googleId,
      authProvider: 'google',
    });
  } else if (!user.googleId && user.authProvider === 'local') {
    user.googleId = googleId;
    await user.save();
  }

  if (user.status === 'blocked') {
    return res.status(403).json({ success: false, message: 'Account has been blocked' });
  }

  const token = generateToken(user);
  res.json({
    success: true,
    data: { token, user: sanitizeUser(user) },
  });
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: sanitizeUser(req.user),
  });
});