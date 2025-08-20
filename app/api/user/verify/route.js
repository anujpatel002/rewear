// app/api/user/verify/route.js
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import connectDB from '@/utils/db';
import rewear_User from '@/models/User';

export async function GET() {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;

    if (!session) {
      return NextResponse.json({ valid: false }, { status: 200 });
    }

    const user = JSON.parse(session);
    const dbUser = await rewear_User.findOne({ email: user.email });

    if (!dbUser) {
      return NextResponse.json({ valid: false }, { status: 200 });
    }

    // Only return safe fields to the client
    const safeUser = {
      _id: dbUser._id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
      isActive: dbUser.isActive,
      profilePic: dbUser.profilePic,
      address: dbUser.address,
    };
    return NextResponse.json({ valid: true, user: safeUser }, { status: 200 });
  } catch (err) {
    console.error('Verify error:', err);
    return NextResponse.json({ valid: false, error: 'Internal server error' }, { status: 500 });
  }
}
