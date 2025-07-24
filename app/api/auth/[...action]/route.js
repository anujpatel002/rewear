// File: app/api/auth/[...action]/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import crypto from 'crypto';
import rewear_User from '@/models/User';
import { sendMail } from '@/utils/mail'; // Make sure this utility exists and is functional

// ✅ MongoDB connection
const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
};

// ✅ POST Handler
export async function POST(request, { params }) {
  const { action } = await params;
  await connectDB();
  const body = await request.json();

  if (action[0] === 'signup') {
    const { name, email, password, confirmPassword, role } = body;

    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    const existingUser = await rewear_User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await rewear_User.create({ name, email, password: hashedPassword, role: role || 'user' });

    return NextResponse.json({ message: 'Signup successful!' }, { status: 201 });
  }

  if (action[0] === 'login') {
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await rewear_User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Set isActive to true on login
    user.isActive = true;
    await user.save();

    // Determine user role (admin@gmail.com is admin, otherwise use user.role)
    const userRole = email === 'admin@gmail.com' ? 'admin' : (user.role || 'user');

    // Set session cookie with user info
    const response = NextResponse.json({
      message: 'Login successful',
      user: { name: user.name, email: user.email, role: userRole },
    });

    response.cookies.set('session', JSON.stringify({ name: user.name, email: user.email }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });

    // Set role cookie for middleware
    response.cookies.set('role', userRole, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
  }

  if (action[0] === 'forgot-password') {
    const { email } = body;

    const user = await rewear_User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'No user found with this email' }, { status: 404 });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = Date.now() + 3600000; // 1 hour

    user.resetToken = token;
    user.resetTokenExpiry = expiry;
    await user.save();

    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/forgot-password?token=${token}`;
    await sendMail(user.email, 'Reset Password', `Click here: ${resetUrl}`);

    return NextResponse.json({ message: 'Reset link sent to your email' });
  }

  if (action[0] === 'reset-password') {
    const { token, password, confirmPassword } = body;

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    const user = await rewear_User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    return NextResponse.json({ message: 'Password reset successful' });
  }

  return NextResponse.json({ error: 'Invalid route' }, { status: 404 });
}